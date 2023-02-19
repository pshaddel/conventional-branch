import * as vscode from "vscode";
interface Settings {
  format: string;
  maxBranchNameLength: number;
  separator: string;
  forceBranchNameLowerCase: boolean;
  removeBranchNameWhiteSpace: boolean;
}
export async function fetchSettings(): Promise<Settings> {
  const config = vscode.workspace.getConfiguration("conventional-branch");
  let format: string | undefined = config.get("format");
  let maxBranchNameLength: number | undefined = config.get(
    "maxBranchNameLength"
  );
  let separator: string | undefined = config.get("separator");
  let forceBranchNameLowerCase: boolean | undefined = config.get(
    "forceBranchNameLowerCase"
  );
  let removeBranchNameWhiteSpace: boolean | undefined = config.get(
    "removeBranchNameWhiteSpace"
  );

  if (forceBranchNameLowerCase === undefined) {
    config.update(
      "forceBranchNameLowerCase",
      SETTING_DEFAULT_FORCE_BRANCH_NAME_LOWER_CASE,
      vscode.ConfigurationTarget.Workspace,
      true
    );
    forceBranchNameLowerCase = SETTING_DEFAULT_FORCE_BRANCH_NAME_LOWER_CASE;
  }
  if (removeBranchNameWhiteSpace === undefined) {
    config.update(
      "removeBranchNameWhiteSpace",
      SETTING_DEFAULT_REMOVE_BRANCH_NAME_WHITE_SPACE,
      vscode.ConfigurationTarget.Workspace,
      true
    );
    removeBranchNameWhiteSpace = SETTING_DEFAULT_REMOVE_BRANCH_NAME_WHITE_SPACE;
  }

  if (separator === undefined) {
    config.update(
      "separator",
      SETTING_DEFAULT_SEPARATOR,
      vscode.ConfigurationTarget.Workspace,
      true
    );
    separator = SETTING_DEFAULT_SEPARATOR;
  }
  if (format === undefined) {
    config.update(
      "format",
      SETTING_DEFAULT_FORMAT,
      vscode.ConfigurationTarget.Workspace,
      true
    );
    format = SETTING_DEFAULT_FORMAT;
  }
  // save the default maxBranchNameLength in the settings if it doesn't exist
  if (maxBranchNameLength === undefined) {
    config.update(
      "maxBranchNameLength",
      50,
      vscode.ConfigurationTarget.Workspace,
      true
    );
    maxBranchNameLength = SETTING_DEFAULT_BRANCH_NAME_LENGTH;
  }
  return {
    format,
    maxBranchNameLength,
    separator,
    forceBranchNameLowerCase,
    removeBranchNameWhiteSpace,
  };
}

const SETTING_DEFAULT_BRANCH_NAME_LENGTH = 50;
const SETTING_DEFAULT_SEPARATOR = "-";
const SETTING_DEFAULT_FORMAT = "{Type}/{TicketNumber}/{Branch}";
// const SETTING_DEFAULT_FORMAT = "{AUTHOR}/{Type}/JIRA-{TicketNumber}/{Branch}";
const SETTING_DEFAULT_FORCE_BRANCH_NAME_LOWER_CASE = true;
const SETTING_DEFAULT_REMOVE_BRANCH_NAME_WHITE_SPACE = true;
