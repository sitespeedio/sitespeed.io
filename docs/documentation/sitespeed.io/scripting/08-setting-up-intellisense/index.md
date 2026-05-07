---
layout: default
title: Code completion and IntelliSense
description: Code completion and IntelliSense — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Code completion and IntelliSense

# Code completion and IntelliSense
{:.no_toc}

{:toc}

IntelliSense in Visual Studio Code can significantly enhance your scripting experience with Browsertime and sitespeed.io by providing code completions, parameter info, quick info, and member lists. Here's how to set it up.

### Prerequisites
Before starting, ensure that you have NodeJS and npm installed on your system. You can download them from [NodeJS official website](https://nodejs.org/en/download).

### Step 1: Create a New Project
1. Create a new directory for your project.
2. Open a terminal and navigate to your project directory.
3. Run the following command to initialize a new npm project: `npm init`
4. Follow the prompts to set up your project.

### Step 2: Install Browsertime
To install Browsertime and its types, use npm. In your project directory, run:

```bash
npm install browsertime --save-dev
```

This command installs Browsertime as a developer dependency.

### Step 3: Configure Visual Studio Code
1. In Visual Studio Code, open your project.
2. Go to Settings (use *Ctrl +* , or *Cmd +* , on Mac).
3. Search for *JavaScript › Suggest: Names*.
4. Disable this setting. This helps in ensuring that IntelliSense only suggests existing properties and functions related to Browsertime objects.

### Step 4: Reload Visual Studio Code
After making these changes, reload Visual Studio Code to apply the new settings.

### Step 5: Start Scripting
Now, as you write your Browsertime scripts, IntelliSense will assist you as long as you add the correct parameters. It automatically suggests relevant methods and properties. Here's a template to get you started:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) { 

};
```

### Bonus Tip: Create Custom Snippets
You can further streamline your workflow by creating custom snippets in Visual Studio Code. Learn how to create them at [User Defined Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets) in Visual Studio Code.

Here's an example on how to create a snippet for basic script:

1. **Open VS Code Command Palette**: Press *Ctrl + Shift + P* (or *Cmd + Shift + P* on Mac) to open the Command Palette.
2. **Open Snippets File**: Type Configure User Snippets and select it. Then, choose New Global Snippets file or select an existing language-specific snippets file if you prefer the snippet to be language-specific.
3. **Define Your Snippet**: In the opened JSON file, define your snippet as follows:

```javascript
{
  "sitespeed.io script template": {
    "prefix": "sitespeed.ioScripting",
    "body": [
      "/**",
      " *",
      " * @param {import('browsertime').BrowsertimeContext} context",
      " * @param {import('browsertime').BrowsertimeCommands} commands",
      " */",
      "export default async function (context, commands) {",
      "    // Your code here",
      "};"
    ],
    "description": "Sitespeed.io scripting"
  }
}
```

Replace *"sitespeed.ioScripting"* with your preferred prefix that will trigger the snippet.

4. **Save the Snippets File**: Save the file (*Ctrl + S* or *Cmd + S*).