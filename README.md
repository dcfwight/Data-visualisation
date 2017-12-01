# Data Visualization project

## To-do items
- Need to go in and update all the d3 code for the new version 4. Will not currently work with old syntax.

## Installation
1. Clone the entire directory to your local machine. `git clone https://github.com/dcfwight/Data-visualisation.git`
1. Start up a local server. E.g. `$ python3 -m http.server`
1. This should then start serving on local host, port 8000.
1. Open your brower and navigate to [localhost:8000](http://localhost:8000)

# Summary
- I have taken data from the Prosper Loan database. I have averaged it across occupations and across income groups.
- I want the data to show the different average loan rates (APRs), across each different occupation. This should allow the user to compare whether, for example, a bus driver has a different APR to a pilot, even if they have the same income level.
- I want the user to be able to easily switch between occupations and compare to the average.

# Design
- I made the following design choices following feedback:
1. Reduce the number of colours from a rainbow palette to just one.
1. Add introductory paragraph to set the scene better.
1. Add the ability to select an occupation and highlight it's data (whilst still keeping the rest of the data plotted for reference)
1. Adjust the speed of the animation, to a level which cycles through the occupations quickly, but not so quick that you cannot see them.
1. Identified a mistake in my inital data capture, following feedback
1. Reduced the weight of the horizontal grid lines to a more muted, less distracting shade of grey.
1. NOTE - the previous iterations of the project are linked in the gist. The link to the bl.ocks is [here](http://bl.ocks.org/dcfwight/e8a7e35d8b5c485b844d)

Resources
- Udacity Nano course, Mike Bostock, Scott Murray, Nikhil Nathwani blog on building buttons: [here](http://www.nikhil-nathwani.com/blog/posts/radio/radio.html)
