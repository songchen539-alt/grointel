import os

path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\channel\opportunity\[matchId]\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Move ActionButton and ModalForm OUTSIDE the main component
# Step 1: Find where ActionButton is defined inside the component
old_action = '''
  function ActionButton({ action, label, icon, color, disabled }: { action: string; label: string; icon: React.ReactNode; color: string; disabled?: boolean }) {
    if (disabled) return null;
    return (
      <button onClick={() => setModal({ type: action, show: true })} disabled={actionLoading !== null}
        className={"inline-flex items-center gap-1.5 rounded-lg " + color + " px-4 py-2 text-xs font-medium text-white disabled:opacity-50 transition-all"}>
        {icon} {label}
      </button>
    );
  }'''

new_action = ''''''
c = c.replace(old_action, new_action)

# Step 2: Find ModalForm definition
old_modal_start = '  function ModalForm({ type }: { type: string }) {'
old_modal_end = '    </div>\n    );\n  }'

# Just find the whole block and remove it
# Start from the function definition
modal_start_idx = c.find(old_modal_start)
if modal_start_idx >= 0:
    # Find the matching closing } for the function
    brace_depth = 0
    started = False
    end_idx = modal_start_idx
    for i in range(modal_start_idx, len(c)):
        if c[i] == '{':
            brace_depth += 1
            started = True
        elif c[i] == '}':
            brace_depth -= 1
        if started and brace_depth == 0:
            end_idx = i + 1
            break
    # Also need to remove the closing bracket of the component
    
    # Remove the ModalForm function
    c = c[:modal_start_idx] + c[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

# Now add the components OUTSIDE, before the main component
# Find where the main component starts
old_main = "export default function ChannelOpportunityPageClient()"

new_components = """function ActionButton({ action, label, icon, color, disabled, onClick }: { action: string; label: string; icon: React.ReactNode; color: string; disabled?: boolean; onClick: () => void }) {
    if (disabled) return null;
    return (
      <button onClick={onClick} disabled={disabled}
        className={"inline-flex items-center gap-1.5 rounded-lg " + color + " px-4 py-2 text-xs font-medium text-white disabled:opacity-50 transition-all"}>
        {icon} {label}
      </button>
    );
  }

function ModalForm({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-black p-6">
        <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function ChannelOpportunityPageClient()"""

c = open(path, encoding='utf-8').read()
c = c.replace(old_main, new_components)

# Now fix the JSX references - ActionButton now uses onClick prop
# Replace: <ActionButton action="accept" label="Accept Opportunity"... 
# With: <ActionButton action="accept" label="Accept Opportunity"...
# Actually the ActionButton now takes onClick instead of action
# Let me fix each usage

fixes = [
    ('action="accept" label="Accept Opportunity" icon={', 'onClick={() => setModal({ type: "accept", show: true })} label="Accept Opportunity" icon={'),
    ('action="decline" label="Decline" icon={', 'onClick={() => setModal({ type: "decline", show: true })} label="Decline" icon={'),
    ('action="more-info" label="Need More Information" icon={', 'onClick={() => setModal({ type: "more-info", show: true })} label="Need More Information" icon={'),
    ('action="schedule-intro" label="Schedule Introduction" icon={', 'onClick={() => setModal({ type: "schedule-intro", show: true })} label="Schedule Introduction" icon={'),
    ('action="notes" label="Leave Internal Note" icon={', 'onClick={() => setModal({ type: "notes", show: true })} label="Leave Internal Note" icon={'),
]

for old, new_val in fixes:
    c = c.replace(old, new_val)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Refactored - components moved outside')
