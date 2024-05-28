import * as vscode from "vscode";
import { GitExtension } from "./git";
import { fetchSettings } from "./settings";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "conventional-branch.newBranch",
    async () => {
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
        await createGitBranch(branch, forcedParentBranch);
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
      if (value && value.length > 50) {
        return `${field} must be less than 50 characters`;
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

async function createGitBranch(branch: string, forcedParentBranch?: string | null) {
  const extension =
    vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  if (extension !== undefined) {
    const api = extension.getAPI(1);
    const repository = api.repositories ? api.repositories[0] : undefined;
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
  } else {
    throw new Error("Git extension not found");
  }
}
