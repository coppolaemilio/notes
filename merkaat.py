# Custom
import random
def random_number():
    return ''.join(random.sample('0123456789'*6, 6))

# Dictionary to call functions from strings
functions = {'random_number': random_number}
files = ['index.mk.html']


#--------
# Merkaat
# Automation script for making static websites
#--------

import re

for mk_file in files:
    # Read the content of each file inside the files array
    with open(mk_file) as f:
        file = f.readlines()

    final_file = ''
    for line in file:
        # Searching the content inside of {{ }}
        m = re.search(r'\{\{(.*?)\}\}', line)
        # If it found {{ }} in the line
        if m:
            # Get the content of the string {{ random_number }} would be ' random_number ' and then I remove the spaces
            found = m.group(1).replace(' ', '')
            # Replace from the line content the {{ namehere }} with the function to call
            line = re.sub(r'\{\{(.*?)\}\}', functions[found](), line.rstrip())
        # Add the line to the file
        final_file += line

    # Replace the name of the file to write the final content
    with open(mk_file.replace('.mk.html','.html'), 'w') as f:
        f.write(final_file)