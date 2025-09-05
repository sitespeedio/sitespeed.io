# How to contribute
Sitespeed.io continues to evolve thanks to people who contributes, so please please help out. Check our [list](../HELP.md) of what you can do to help us.

## Making changes
If you want help out, that's great! Before taking the time to code something big, feel free to open an issue first proposing your idea to other contributors, that way you can get feedback on the idea before taking time to write precious code.

### AI-Assisted Contributions

When using AI tools like ChatGPT to assist with development, please a) disclose it in your commits and pull requests.

#### Commits

When writing a commit message for a change that was assisted by an AI, please add the `AI-assisted-by:` trailer to the commit message body.

**Example:**

```
Add Cumulative Layout Shift metric to the summary page

Add the Cumulative Layout Shift (CLS) introduced by Google on
the summary page. Show both median and p75.

AI-assisted-by: ChatGPT
```

#### Pull Requests

When creating a pull request that includes AI-assisted work, please mention it in the pull request description.

**Example:**

> This pull request implements user profile caching with assistance from ChatGPT.


## Add a defect
Please make sure you run the [latest version](https://www.npmjs.com/package/sitespeed.io) of sitespeed.io. Then check the [defect/bug list](https://github.com/sitespeedio/sitespeed.io/issues?labels=bug&page=1&state=open) to make sure that it hasn't been filed yet.

If you find a defect, please file a bug report. Include the following:
 - Explain the bug/defect and what you where doing.
 - OS & versions
 - Always add the URL of the page you where analysing (if it is secret, drop me an email peter**at**soulgalore.com and send me the address).
 - Add a screenshot and clearly point out where the defect is (if applicable)
 - Include the content of the sitespeed.io.log file in a [gist](https://gist.github.com/) and attach it to the issue.

If you have the skills & the time, it is perfect if you send a pull request with a fix, that helps us a lot!

## Add a change request/new functionality request
If you have an idea or something that you need sitespeed.io to handle, add an issue and lets discuss it there. Ideas/changes/requests are very very welcome!

Thanks for your time & support!

Peter
