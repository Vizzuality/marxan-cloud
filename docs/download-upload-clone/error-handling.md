## Import error handling

If an `Import` fails, a database cleanup is scheduled in order to remove inconsistent data. There are a few 'extreme' cases when a database cleanup cannot be scheduled:

-   While trying to mark a `ImportComponent` as completed:
    -   If the `Import` aggregate is not found
    -   If the `ImportComponent` is not found inside the `Import`
    -   If the `save` operation of `ImportRepository` fails
-   While trying to mark a `ImportComponent` as failed:
    -   If the `Import` aggregate is not found
    -   If the `ImportComponent` is not found inside the `Import`
    -   If the `save` operation of `ImportRepository` fails
-   While trying to schedule a `import-piece` job:
    -   If the `Import` aggregate is not found
    -   If the `ImportComponent` is not found inside the import

In these 'extreme' cases only an api event will be inserted indicating that the import failed and why it is not possible to schedule a database cleanup. If the api event insertion fails a log will be prompted
