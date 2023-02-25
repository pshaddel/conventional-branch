# Conventional Branch

![release](https://github.com/pshaddel/conventional-branch/actions/workflows/release-deploy.yml/badge.svg)
![cicd](https://github.com/pshaddel/conventional-branch/actions/workflows/cicd.yml/badge.svg)
<p align="center">
<img src="icon-title.png" width="65%">  
</p>

Conventional Branch" is a tool designed to help standardize branch names in Git for teams working on large projects. The extension allows you to choose from several pre-defined templates, which can be customized to suit your team's specific needs. Once a template is selected, you can easily create new branches with standardized names directly from your IDE. This helps to avoid confusion and promote consistency in branch naming conventions across the team. With "Conventional Branch", you can spend less time thinking about branch names and more time focusing on your work.

## Usage
<p align="center">
<img src="https://user-images.githubusercontent.com/43247296/221373876-7bc68f97-1ed2-4a73-b67c-d0a3eb74c5bd.gif" width="65%">  
</p>

You can access VSCode Conventional Branch by using
`Command + Shift + P` or `Ctrl + Shift + P`, enter `Conventional Branch`, and press Enter.
### How to Customize Branch Name Template
Got to <b>User Settings > Conventionl Branch > format<b>
You can change the default format and keep in mind that these are reserved keywords in this template: `Branch`, `TicketNumber` and `Type`.

Examples of templates:
* `{Author}/{Type}/JIRA-{TicketNumber}/{Branch}`
* `myGithubUserName/Trello-{IssueNumber}/{Branch}`
* `{Type}/{Branch}`

<p align="center">
<img src="https://user-images.githubusercontent.com/43247296/221375775-4f64a93b-a9f5-4226-b46f-62c61d93b255.gif" width="65%">  
  </p>

## Features

Base thing we are using is a format which is by default:

`{Type}/{TicketNumber}/{Branch}`

`Type` is a special name. It is an enum that contains different types of branch like `feat`, `bug` and some other options(you can change it via settings).

`Branch` is also something special. It is the branch name. By default some operations are enabled for branch name. For example we are removing the whitespaces. Or we are converting the text to lower case. These are customaizable options.

## Extension Settings

| Property                                       | Description                                                                        | Default Value                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| conventional-branch.type                       | An array that contains different type of branches.                                 | ["feature","fix","hotfix","docs","refactor","style","test","release"] |
| conventional-branch.branchNameSeparator        | Branch string must be separated by something. It could be space, dash or anything. | "-"                                                                   |
| conventional-branch.maxBranchNameLength        | Set a maximum lenght for the branch name.                                          | 50                                                                    |
| conventional-branch.forceBranchNameLowerCase   | A boolean that converts branch name to lower case                                  | true                                                                  |
| conventional-branch.removeBranchNameWhiteSpace | Removes whitespaces from branch.                                                   | true                                                                  |
| conventional-branch.format                     | Format for creating branch.                                                        | "{Type}/{TicketNumber}/{Branch}"                                      |
| conventional-branch.minBranchNameLength        | Minimum lengh for branch name.                                                     | 3                                                                     |
