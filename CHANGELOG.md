# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2024-07-07

### Added
- Modified the initial dataset: 20240706_KB.json
  1) Created a new entry for 1.5_value_chain under CEO and assigned an unused ID value
  2) Created 3 new entries for 2.5_value_link under the new Value Chain and assigned unused ID values
  3) Updated node_type from 4_methodology to  2.5_value_link for 4 nodes that contained the term “Value Link” in the node_label (e.g., “Mahla Solo  Value Link”)
  4) Added a values column: assigned preset values to each node type to reflect relative sizes, per the instructions 
- Created a dummy dataset for testing: 20240706_DataGov.json

### Changed
- parseData.js
  5)	Restored the role hierarchy for all charts
  6)	Replaced “KB Tree” with “Chief Executive Officer” as the topmost node 
  7)	For ease of use, moved the logic to map color to node_type from Output.jsx into parseData.js
  8)	To improve readability in the charts, added a function to abbreviate common C-level roles

Output.jsx
  9)	Updated the color scheme, adding 1.5_value_chains and 2.5_value_links 

renderTree.js
  10)	Added a resize event listener to maximize the available screen width and update the chart when the window size changes
  11)	To improve readability of the chart, truncated the node labels so that the maximum length of text displayed is 25 characters followed by “…”
  12)	Added tooltips to display the node’s full name when hovering on the name and the full path when hovering over the circle
  13)	The size of the clickable/zoomable dots differs based on node type (Roles are largest)
  14)	To give a visual cue when a node contains children, those node names are underlined (attempts to remove the underline once the node is expanded have not worked so far).

renderRadial.js
  15)	Attempted various options to improve the chart’s readability (i.e., adjusting the font size & spacing between parent/child nodes, adding a scaling factor, & modifying the center point)
  16)	Truncated the node labels so that the maximum length of text displayed is 13 characters followed by “…”
  17)	Tooltips display the node’s full path and its total value on the next line when hovering over the node’s name
  18)	Adjusted the calculation of a node’s total value as the sum of the node’s value and its children’s values 
  19)	Added tooltips to display the node’s full path and, below it, the node’s total value

renderCircle.js
  20)	Added Royal Blue as the background color for the Roles circles
  21)	Adjusted the calculation of a node’s total value as the sum of the node’s value and its children’s values 
  22)	Set the size of each circle based on preset values per node type, and leverage the chart logic to adjust the circle size based on the number & type of child nodes
  23)	To unclutter the chart, set truncation to 25 chars for the node names and removed the display of node value to make more space for the names
  24)	Adjusted the tooltip to display the node’s full name and total value
  25)	Dynamically apply the font size based on the node’s value, so that the font size is reduced for the smallest nodes 
  26)	Fixed: added borders when a childless node’s parent is of the same node type

## [0.1.0] - 2024-07-01

### Added
- First mockup of the advanced charting functionality
- Based on the KB code sample provided, this mockup displays all three d3 chart types requested
- Provides a simple workflow: 
  1) The user selects a JSON file to upload
  2) The user selects a chart type from a dropdown list
  3) The selected chart generates automatically 
- While experimenting with the charts, we found that they looked better when collapsing the Role hierarchy, the primary node.  In the KB code sample, some roles were children of other roles which caused the charts to look jumbled.
- The 'Circle Pack' chart requires a value to calculate the size of each node.  We used the values available in the ID field just for demo purposes.  But if we could get a dataset with values that have significance for each KB node, then the size of each circle in the chart would have some meaning.
- Added colors based on node type 
