path = r'C:\Users\LENOVO\.openclaw\workspace\grointel\src\app\admin\dashboard\page.tsx'
with open(path, encoding='utf-8') as f:
    c = f.read()

# Add Globe back to the lucide-react import
c = c.replace(
    'AlertTriangle, Database, BarChart3, Users, Eye, MousePointerClick, Activity, TrendingUp, UserPlus, Target, FileText, Mail',
    'AlertTriangle, Database, BarChart3, Users, Eye, MousePointerClick, Activity, TrendingUp, UserPlus, Target, FileText, Mail, Globe'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed Globe import')
