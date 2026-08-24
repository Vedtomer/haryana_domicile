import os
import re

controllers = {
    'HaryanaDomicileController.php': 'admin.haryana-domicile',
    'BirthRecordController.php': 'admin.birth-records',
    'MarriageFormController.php': 'admin.marriage-forms',
    'MarriageAffidavitController.php': 'admin.marriage-affidavits'
}

base_path = '/home/whitedevil/haryana_domicile/app/Http/Controllers/Admin'

for file, route_base in controllers.items():
    filepath = os.path.join(base_path, file)
    if not os.path.exists(filepath):
        print(f"{file} not found")
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()

    pattern = r"(return redirect\(\)->route\('"+route_base+r"\.index'\)[^;]+;)"
    
    store_idx = content.find('public function store')
    edit_idx = content.find('public function edit')
    if store_idx != -1 and edit_idx != -1:
        store_content = content[store_idx:edit_idx]
        match_store = re.search(pattern, store_content)
        if match_store:
            orig = match_store.group(1)
            create_return = orig.replace('.index', '.create')
            
            replacement = f"""if ($request->boolean('save_and_create')) {{
            {create_return}
        }}

        {orig}"""
            new_store_content = store_content.replace(orig, replacement)
            content = content[:store_idx] + new_store_content + content[edit_idx:]
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Patched {file}")
        else:
            print(f"Could not find return in store method of {file}")
