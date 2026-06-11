# Quick Reference: Stop/Resume Tracking Feature

## 🎯 What You Can Do Now

| Action | Button | Color | Result |
|--------|--------|-------|--------|
| **Stop Tracking** | ⏸️ Stop | Yellow | Profile marked as "⏸️ Paused" |
| **Resume Tracking** | ▶️ Resume | Green | Profile marked as "🔴 Tracking" |

---

## 🚀 Getting Started (5 minutes)

### 1. Create Database Table
```bash
cd backend
python add_tracking_status.py
```
✅ Table created! You should see:
```
✅ Successfully created tracking_status table!
```

### 2. Start Application
```bash
# Use the launcher file
launch.bat
```
Or manually:
```bash
# Terminal 1
cd backend && python -m uvicorn app.main:app --reload

# Terminal 2  
cd frontend && npm run dev
```

### 3. Access the Feature
- Open: `http://localhost:5173`
- Go to: "Profile Tracking" page
- **Done!** 🎉

---

## 📱 How to Use

### Stop Tracking a Profile
```
1. Find the alumni in "Profile Tracking"
2. Look for "🔴 Tracking" badge
3. Click "⏸️ Stop" button
4. See: "✓ Tracking stopped for [Name]"
5. Badge changes to "⏸️ Paused"
```

### Resume Tracking a Profile
```
1. Find the alumni with "⏸️ Paused" badge
2. Click "▶️ Resume" button
3. See: "✓ Tracking resumed for [Name]"
4. Badge changes back to "🔴 Tracking"
```

---

## 📊 What Gets Recorded

| Field | Value | Example |
|-------|-------|---------|
| Alumni Name | From database | "John Doe" |
| Action | Stop or Resume | "Paused" |
| Timestamp | When action happened | 2026-06-09 14:30:45 |
| Status | Current state | true/false |

---

## 🎨 Visual Guide

### Tracking Active (Green)
```
┌─────────────────────────────┐
│ 👤 John Doe                 │
│ 🟢 Tracking (Green badge)   │
│ New job at Google           │
│ Changed 2 hours ago         │
│ [⏸️ Stop]                   │
└─────────────────────────────┘
```

### Tracking Paused (Yellow)
```
┌─────────────────────────────┐
│ 👤 Jane Smith               │
│ 🟡 Paused (Yellow badge)    │
│ Moved to London             │
│ Changed 1 day ago           │
│ [▶️ Resume]                 │
└─────────────────────────────┘
```

---

## ⚡ API Reference

### Stop Tracking
```
POST /analytics/tracking/stop/1

Response:
{
  "success": true,
  "message": "Tracking stopped for John Doe",
  "alumni_name": "John Doe",
  "tracking_paused_at": "2026-06-09T14:30:45.123Z"
}
```

### Resume Tracking
```
POST /analytics/tracking/resume/1

Response:
{
  "success": true,
  "message": "Tracking resumed for John Doe",
  "alumni_name": "John Doe",
  "tracking_resumed_at": "2026-06-09T14:35:20.654Z"
}
```

---

## 🔐 Database Schema

### New Table: `tracking_status`
```sql
CREATE TABLE tracking_status (
    id SERIAL PRIMARY KEY,
    alumni_id INTEGER UNIQUE NOT NULL,
    is_tracking BOOLEAN DEFAULT TRUE,
    tracking_paused_at TIMESTAMP NULL,
    tracking_resumed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (alumni_id) REFERENCES alumni_master(id)
);
```

---

## ❓ FAQ

**Q: Will existing data be lost?**
A: No! The new table is separate and doesn't affect existing data.

**Q: Can I track multiple profiles?**
A: Yes! Each profile is independent.

**Q: What if I forget why I paused a profile?**
A: Check the timestamps - they show exactly when you paused/resumed.

**Q: Can I pause all profiles at once?**
A: Currently no, but they can be paused individually. Feature for bulk operations coming soon!

**Q: Will the system still detect changes for paused profiles?**
A: No! Paused profiles won't have new changes recorded until resumed.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Button doesn't work | Check console (F12) for errors |
| "Alumni not found" | Verify alumni exists in database |
| Table doesn't exist | Run `python add_tracking_status.py` |
| Backend connection error | Ensure backend is running on port 8000 |

---

## 📚 Full Documentation

For more details, see:
- `TRACKING_FEATURE.md` - Complete feature guide
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `API Docs` - Visit `/docs` when backend is running

---

## ✅ Checklist

- [ ] Run `python add_tracking_status.py`
- [ ] Start backend and frontend
- [ ] Open tracking page
- [ ] Test "Stop" button
- [ ] Test "Resume" button
- [ ] See confirmation messages

---

## 🎓 Examples

### Example 1: Monitor only recent graduates
```
Stop tracking alumni from > 5 years ago
Resume tracking only recent batch
Reduces noise, focuses on current trends
```

### Example 2: Temporary pause
```
Pause tracking during system maintenance
Resume when maintenance is complete
Data continues from where it left off
```

### Example 3: Focus on specific roles
```
Resume tracking for "Software Engineers"
Stop tracking for other roles
Get targeted insights
```

---

## 📞 Need Help?

1. Check the documentation files
2. Review error messages
3. Look at the API documentation (`/docs`)
4. Check browser console for JavaScript errors
5. Verify database connection

---

**Version**: 1.0  
**Status**: ✅ Ready to Use  
**Last Updated**: 2026-06-09
