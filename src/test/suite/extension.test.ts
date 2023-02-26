import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { branchNameStringConverter, extractFileds } from "../../extension";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", () => {
  // vscode.window.showInformationMessage("Start all tests.");

  // test("Sample test", () => {
  //   assert.strictEqual(-1, [1, 2, 3].indexOf(5));
  //   assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  // });

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

    assert.strictEqual(format, "{Type}/{TicketNumber}/{Branch}");
    // assert array should contain these fields
    assert.equal(type, ["feature", "fix", "test", "hotfix", "release"]);
    assert.strictEqual(minBranchNameLength, 3);
    assert.strictEqual(maxBranchNameLength, 50);
    assert.strictEqual(branchNameSeparator, "-");
    assert.strictEqual(forceBranchNameLowerCase, true);
    assert.strictEqual(removeBranchNameWhiteSpace, true);
  });

  test("extractFileds should return fields based on format", () => {
    const format = "{Type}/{TicketNumber}/{Branch}/{SomethingElse}";
    const fields = extractFileds(format);
    assert.equal(fields, ["Type", "TicketNumber", "Branch", "SomethingElse"]);
  });

  test("branchNameStringConverter should return a string with the correct format", () => {
    assert.strictEqual(
      branchNameStringConverter("Fetch All UserS ", {
        forceBranchNameLowerCase: true,
        removeBranchNameWhiteSpace: true,
        branchNameSeparator: "-",
      }),
      "fetch-all-users"
    );

    assert.strictEqual(
      branchNameStringConverter("Fetch All UserS ", {
        forceBranchNameLowerCase: false,
        removeBranchNameWhiteSpace: false,
        branchNameSeparator: "%",
      }),
      "Fetch%All%UserS%"
    );
  });

  test("Create branch with default settings", async () => {});
});
