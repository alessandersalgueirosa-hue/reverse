with open('public/leads.html', 'r', encoding='utf8') as f:
    content = f.read()

# Find the position of 'Já é Cliente' 
idx = content.find('Já é Cliente')
print(f'Found at index: {idx}')

# Print context around the find
if idx >= 0:
    print('Context:', repr(content[idx-50:idx+100]))