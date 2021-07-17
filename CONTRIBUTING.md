# Contributing
If you would like to contribute, here's some information about the project:

## Guidelines on implementing features
If you would like to implement a new feature, here are some things to keep in mind:

### Use hooks
AoPS Enhanced has a feature called hooks that makes it easier to create features that instantly toggle on and off.
Your feature should generally be of the form of a IIFE that returns a function, passed to enhanced_settings.add_hook.

For example, for the general layout of a toggleable feature:
```javascript
enhanced_settings.add_hook('feature_setting_name', (() => {
  // Initialize variables such as elements that will be reused.
  // YOUR CODE HERE
  return value => {
    if (value) {
      // Handle enabling the feature
      // YOUR CODE HERE
    } else {
      // Handle disabling the feature
      // YOUR CODE HERE
    }
  };
})(), true);
```

### Clean failure
Your feature should first of all avoid potential errors as much as possible.
In case that is not possible, make sure it does not cause other features to fail.
In particular one of the things to be careful about is when AoPS.Community is not set.

### Implementing old features
Here is a list of some features dropped/not yet implemented in v6 if you feel like implementing them.
* Moderators can edit in locked topics
* Dark themes
* Add custom tags to autotagging
* Read messages deleted while on topic
* Filter out threads with titles matching custom phrases
