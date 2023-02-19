# Conventional Branch

Conventional Branch" is a tool designed to help standardize branch names in Git for teams working on large projects. The extension allows you to choose from several pre-defined templates, which can be customized to suit your team's specific needs. Once a template is selected, you can easily create new branches with standardized names directly from your IDE. This helps to avoid confusion and promote consistency in branch naming conventions across the team. With "Conventional Branch", you can spend less time thinking about branch names and more time focusing on your work.

## Features

Base thing we are using is a format which is by default: `{Type}/{TicketNumber}/{Branch}`

Type is an enum that contains different types of branch like `feat`, `bug` and some other options.

`Branch` is also something special. It is the branch name. By default some operations are enabled for branch name. For example we are removing the whitespaces. Or we are converting the text to lower case. These are customaizable options.

### Choose Your Desired Template!

Feel free to choose your own template. An example is this:
`{AUTHOR}/JIRA-{TicketNumber}/{Type}/{Branch}`

The prompt will first ask you for Author!

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

- `myExtension.enable`: Enable/disable this extension.
- `myExtension.thing`: Set to `blah` to do something.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
