import * as vscode from "vscode";

const SETTING_DEFAULT_BRANCH_NAME_LENGTH = 50;
const SETTING_DEFAULT_SEPARATOR = "-";
const SETTING_DEFAULT_FORMAT = "{Type}/{TicketNumber}/{Branch}";
const SETTING_DEFAULT_FORCE_BRANCH_NAME_LOWER_CASE = true;
const SETTING_DEFAULT_REMOVE_BRANCH_NAME_WHITE_SPACE = true;
const SETTING_DEFAULT_MIN_BRANCH_NAME_LENGTH = 3;
const SETTING_DEFAULT_BRANCH_TYPE = [
  "feature",
  "fix",
  "hotfix",
  "release",
  "test",
];
interface Settings {
  format: string;
  maxBranchNameLength: number;
  branchNameSeparator: string;
  forceBranchNameLowerCase: boolean;
  removeBranchNameWhiteSpace: boolean;
  minBranchNameLength: number;
  forcedParentBranch?: string | null;
  type: string[];
}
export async function fetchSettings(): Promise<Settings> {
  const config = vscode.workspace.getConfiguration("conventional-branch");
  const format: string | undefined = config.get("format");
  const type: string[] | undefined = config.get("type");
  const minBranchNameLength: number | undefined = config.get(
    "minBranchNameLength"
  );
  const maxBranchNameLength: number | undefined = config.get(
    "maxBranchNameLength"
  );
  const branchNameSeparator: string | undefined = config.get("separator");
  const forceBranchNameLowerCase: boolean | undefined = config.get(
    "forceBranchNameLowerCase"
  );
  const removeBranchNameWhiteSpace = config.get(
    "removeBranchNameWhiteSpace"
  ) as boolean;

  const forcedParentBranch = config.get("forcedParentBranch") as string | null;

  return {
    format: format || SETTING_DEFAULT_FORMAT,
    maxBranchNameLength:
      maxBranchNameLength || SETTING_DEFAULT_BRANCH_NAME_LENGTH,
    branchNameSeparator: branchNameSeparator || SETTING_DEFAULT_SEPARATOR,
    forceBranchNameLowerCase:
      forceBranchNameLowerCase || SETTING_DEFAULT_FORCE_BRANCH_NAME_LOWER_CASE,
    removeBranchNameWhiteSpace:
      removeBranchNameWhiteSpace ||
      SETTING_DEFAULT_REMOVE_BRANCH_NAME_WHITE_SPACE,
    minBranchNameLength:
      minBranchNameLength || SETTING_DEFAULT_MIN_BRANCH_NAME_LENGTH,
    type: type || SETTING_DEFAULT_BRANCH_TYPE,
    forcedParentBranch,
  };
}
