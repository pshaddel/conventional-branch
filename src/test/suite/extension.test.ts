import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test("Expect default settings to be set", async () => {
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

    assert.strictEqual(format, "feature/{TicketNumber}/{Branch}");
    assert.strictEqual(type, ["feature", "fix", "hotfix", "release", "test"]);
    assert.strictEqual(minBranchNameLength, 3);
    assert.strictEqual(maxBranchNameLength, 50);
    assert.strictEqual(branchNameSeparator, "-");
    assert.strictEqual(forceBranchNameLowerCase, true);
    assert.strictEqual(removeBranchNameWhiteSpace, true);
  });
});
