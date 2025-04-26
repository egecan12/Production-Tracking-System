#!/bin/bash

# Array of files that need the "use client" directive
files=(
  "app/employees/page.tsx"
  "app/page.tsx"
  "app/employees/edit/[id]/page.tsx"
  "app/workorders/page.tsx"
  "app/orders/page.tsx"
  "app/workorders/[id]/page.tsx"
  "app/machines/page.tsx"
  "app/components/SystemAuthProvider.tsx"
  "app/components/OrderList.tsx"
  "app/machines/[id]/page.tsx"
  "app/machines/add/page.tsx"
  "app/components/WireProductionCalculator.tsx"
  "app/components/OrderForm.tsx"
  "app/customers/page.tsx"
  "app/customers/edit/[id]/page.tsx"
)

# Loop through each file and add the "use client" directive
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if file already has "use client" directive
    if ! grep -q "use client" "$file"; then
      echo "Adding 'use client' directive to $file"
      
      # Create a temporary file
      temp_file=$(mktemp)
      
      # Add the "use client" directive at the top of the file
      echo '"use client";' > "$temp_file"
      echo "" >> "$temp_file"
      cat "$file" >> "$temp_file"
      
      # Replace the original file with the modified file
      mv "$temp_file" "$file"
    else
      echo "File $file already has 'use client' directive"
    fi
  else
    echo "File $file does not exist"
  fi
done

echo "Done!" 