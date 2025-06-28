import * as vscode from "vscode";
import { GitExtension, Repository } from "./git";
import { fetchSettings } from "./settings";
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "conventional-branch.newBranch",
    async () => {
      // check if git extension is available and get the git API
      const extension =
        vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
      if (!extension) {
        vscode.window.showErrorMessage(
          "Git extension not found. Please install the Git extension."
        );
        return;
      };
      const git = extension.getAPI(1);

      let folder: vscode.WorkspaceFolder | undefined;
      let repository: Repository | undefined;
      // is it multi-root workspace?
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
        // if yes, then show a quick pick to select the workspace folder
        // if there are multiple workspace folders, we need to select one
        if (git.repositories.length === 0) {
          vscode.window.showErrorMessage(
            "No Git repositories found in the workspace. Please open a folder with a Git repository."
          );
          return;
        };

        // show a quick pick to select the workspace folder + current branch of each repository
        const workspaceFolders = git.repositories.map((repo) => {
          const folder = vscode.workspace.getWorkspaceFolder(repo.rootUri);
          return {
            // workspace folder name or root URI base
            label: folder?.name || path.basename(repo.rootUri.fsPath),
            description: repo.state.HEAD ? repo.state.HEAD.name : "No branch",
            repository: repo,
          };
        });


        const selectedFolder = await vscode.window.showQuickPick(workspaceFolders, {
          placeHolder: "Select a workspace folder",
        });
        if (!selectedFolder) {
          return;
        }
        // get the selected workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders.find(
          (folder) => folder.uri.fsPath === selectedFolder.repository.rootUri.fsPath
        );
        if (!workspaceFolder) {
          vscode.window.showErrorMessage("Workspace folder not found");
          return;
        }
        folder = workspaceFolder;
        repository = selectedFolder.repository;
      } else {
        // if there is only one workspace folder, use it
        folder = vscode.workspace.workspaceFolders?.[0];
        if (!folder) {
          vscode.window.showErrorMessage(
            "No workspace folder found. Please open a folder with a Git repository."
          );
          return;
        }
        repository = git.repositories[0];
      };

      // read the format from settings
      const settings = await fetchSettings();
      const {
        format,
        maxBranchNameLength,
        minBranchNameLength,
        forcedParentBranch,
        branchNameSeparator,
        forceBranchNameLowerCase,
        removeBranchNameWhiteSpace,
        type,
      } = settings;
      // extract the fields from the format
      const fields = extractFields(format);
      // sequentially fetch the values for each field
      const values: string[] = [];
      for await (const field of fields) {
        if (field === "Type") {
          const value = await vscode.window.showQuickPick(type, {
            placeHolder: "Select a Branch Type",
          });
          if (value) {
            values.push(value);
          }
          if (!value) {
            return;
          }
        } else if (field === "Branch") {
          let value = await fetchText(
            "Branch Name",
            maxBranchNameLength,
            minBranchNameLength
          );
          if (!value) {
            return;
          }
          if (forceBranchNameLowerCase && value) {
            value = value.toLowerCase();
          }
          if (removeBranchNameWhiteSpace && value) {
            value = (value as string).trim();
          }
          // replace spaces with separator
          if (value) {
            value = value.replace(/\s/g, branchNameSeparator);
          }

          if (value) {
            values.push(value);
          }
        } else {
          const fieldType = getFieldType(field);
          if (fieldType === 'string') {
            const value = await fetchText(field);
            if (value) {
              values.push(value);
            }
            if (!value) {
              return;
            }
          } else if (fieldType === 'selector') {
            const textWithoutOptions = field.split('[')[0];
            const value = await vscode.window.showQuickPick(extractOptions(field), {
              placeHolder: `Select a ${textWithoutOptions}`,
            });
            if (value) {
              values.push(value);
            }
            if (!value) {
              return;
            }
          } else {
            throw new Error('Invalid field type: ' + fieldType);
          }
        }
      }
      // replace the fields with the values
      let branch = format as string;
      for (let i = 0; i < fields.length; i++) {
        branch = branch.replace(fields[i], values[i]);
      }
      // replace { and } with empty string
      branch = branch.replace(/{/g, "");
      branch = branch.replace(/}/g, "");
      branch = branch.replace(/\s/g, branchNameSeparator);

      try {
        await createGitBranch(repository, branch, forcedParentBranch);
      } catch (error) {
        vscode.window.showInformationMessage(
          `We want to create this branch: ${branch} but we got this error: ${error}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export async function fetchText(
  field: string,
  maxLength?: number,
  minLength?: number
) {
  return vscode.window.showInputBox({
    placeHolder: `Enter a ${field}`,
    validateInput: (value) => {
      if (minLength) {
        if (!value || value.length < minLength) {
          return `${field} must be at least ${minLength} characters`;
        }
      }
      if (!maxLength) {
        return;
      }
      if (value && value.length > maxLength) {
        return `${field} must be less than ${maxLength} characters`;
      }
      return;
    },
  });
}
/**
 * fetch string out of text which are wrapped in {} for example if we give this string "{Type}/{TicketNumber}/{Branch}" we expect an array: ["Type", "TicketNumber", "Branch"]
 *  */
export function extractFields(format: string) {
  const regex = /\{([^}]+)\}/g;
  const fields: string[] = [];
  let m;
  while ((m = regex.exec(format)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) {
        fields.push(match);
      }
    });
  }
  return fields;
}

/**
 * We have two types of fields: string and selector. This function will return the type of the field
 * @param field string like this: Author[Poorshad,John,Smith] or Author
 * @returns `string` or `selector`
 */
export function getFieldType(field: string): 'string' | 'selector' {
  if (field.includes('[') && field.includes(']')) {
    return 'selector';
  }
  if ((field.includes('[') && !field.includes(']')) || (!field.includes('[') && field.includes(']'))){
    throw new Error('Invalid Selector Field format: ' + field);
  }
  return 'string';
}

/**
 * Extract options from a string like this: `Author[Poorshad,John,Smith]` and return an array of options `["Poorshad", "John", "Smith"]`
 */
export function extractOptions(field: string) {
  const regex = /\[(.*)\]/;
  const match = field.match(regex);
  if (!match) {
    throw new Error('Invalid Selector Field format: ' + field);
  }
  const options = match[1].split(',');
  return options;
}

async function createGitBranch(
  repository: Repository | undefined,
  branch: string,
  forcedParentBranch?: string | null) {
    if (!repository) {
      vscode.window.showErrorMessage("No repository found");
      return;
    }
    if (forcedParentBranch) {
      try {
        await repository.checkout(forcedParentBranch);
        try {
          await repository.createBranch(branch, true);
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create branch ${branch} from ${forcedParentBranch} branch. Error: ${error}`);
          return;
        }
      } catch (error) {

        vscode.window.showErrorMessage(
          `Failed to checkout ${forcedParentBranch} branch. Error: ${error}`
        );
        return;
      }
    } else {
      try {
        await repository.createBranch(branch, true);
      } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage(`Failed to create branch ${branch}`);
        return;
      }
    }
}
