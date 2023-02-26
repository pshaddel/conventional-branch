import * as vscode from "vscode";
import { GitExtension } from "./git";
import { fetchSettings } from "./settings";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "conventional-branch.newBranch",
    async () => {
      //

      // read the format from settings
      const settings = await fetchSettings();
      const {
        format,
        maxBranchNameLength,
        minBranchNameLength,
        branchNameSeparator,
        forceBranchNameLowerCase,
        removeBranchNameWhiteSpace,
        type,
      } = settings;

      // extract the fields from the format
      const fields = extractFileds(format as string);
      // sequentially fetch the values for each field
      const values: string[] = [];
      for await (const field of fields) {
        if (field === "Type") {
          const value = await fetchType(type);
          if (value) {
            values.push(value);
          }
          if (!value) {
            return;
          }
        } else if (field === "TicketNumber") {
          const value = await fetchText("Ticket Number");
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
          const value = await fetchText(field);
          if (value) {
            values.push(value);
          }
          if (!value) {
            return;
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

      try {
        await useGitApi(branch);
      } catch (error) {
        vscode.window.showInformationMessage(
          `We want to create this branch: ${branch} but we got this error: ${error}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

async function fetchType(types: string[]) {
  const type = await vscode.window.showQuickPick(types, {
    placeHolder: "Select a Branch Type",
  });
  return type;
}

async function fetchText(
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
export function extractFileds(format: string): string[] {
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

async function useGitApi(branch: string) {
  const extension =
    vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  if (extension !== undefined) {
    const api = extension.getAPI(1);
    const repository = api.repositories ? api.repositories[0] : undefined;
    if (!repository) {
      vscode.window.showErrorMessage("No repository found");
      return;
    }
    await repository.createBranch(branch, true);
  } else {
    throw new Error("Git extension not found");
  }
}
