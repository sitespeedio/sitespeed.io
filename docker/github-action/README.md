# sitespeed.io GitHub action

If you are using [GitHub Actions](https://github.com/features/actions) beta it's super easy to run sitespeed.io. Remember though that actions are in beta and can change. They are running an small instances at the moment so you shouldn't rely on timing metrics. 

Actions works good with a [performance budget](https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/). You should set your budget in a file in the repo that you are testing. In this example we call the file *budget.json* and put it in the *.github* folder in the repo.

Setup a simple budget that check the URLs you test against number of requests, transfer sise, third parties and different Coach scores ([read the documentation](https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#full-example) on how to configure other metrics):

```json
{
  "budget": {
    "requests": {
        "total": 100
    },
    "transferSize": {
        "total": 400000
    },
    "thirdParty": {
        "requests": 0
    },
    "score": {
      "accessibility": 100,
      "bestpractice": 100,
      "privacy": 100,
      "performance": 100
    }
  }
}
```

Then you can setup your action either via the GitHub GUI or using configuration. Make sure to setup your action to the right Docker file: ```docker://sitespeedio/sitespeed.io:8.0.6-action```.

A simple setup looks something like this:

```shell
workflow "Testing stage environment" {
  on = "push"
  resolves = ["Run sitespeed.io"]
}

action "Run sitespeed.io" {
  uses = "docker://sitespeedio/sitespeed.io:8.0.6-action"
  args = "https://www.sitespeed.io -n 1 --budget.configPath /github/workspace/.github/budget.json"
}
```
As argument you can use all [configurations options](https://www.sitespeed.io/documentation/sitespeed.io/configuration/#the-options) as you usually do with sitespeed.io. Since we don't use any timing metrics in the budget we only do one run.

If your budget fails, your action will fail.

When there's a new sitespeed.io release and you wanna use that you just bump the version number of your action.
