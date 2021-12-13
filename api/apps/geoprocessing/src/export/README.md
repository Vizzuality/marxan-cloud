# Adding new Piece Exporter support

1. Create a class within `/pieces-exporters`
2. Class should be decorated with `@PieceExportProvider()`
3. Class should extend `PieceProcessor`

Nothing else is necessary, as `/pieces` is taking care to register relevant 
processor and "select" it (think of strategy pattern) when a job lands 
within the queue's worker.

# Extending module for versioning

It could be leveraged within `PiecesProvider` (and attaching additional 
metadata about version) or directly within each `piece-exporter`.

This may require additional spike to decide who is responsible for detecting 
which version is supported and/or used.
