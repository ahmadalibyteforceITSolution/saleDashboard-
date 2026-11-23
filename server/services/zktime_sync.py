"""
ZKTime Biometric Attendance Data Synchronization Service
--------------------------------------------------------
This service connects to ZKTime / ZKTeco biometric database (MS Access att2000.mdb / SQL Server)
or network devices via TCP/IP to synchronize attendance punch logs directly with ERP employee payroll.
"""

import sys
import os
import json
from datetime import datetime, timedelta

class ZKTimeSynchronizer:
    def __init__(self, db_path=None, erp_api_url=None):
        self.db_path = db_path or "C:\\Program Files (x86)\\ZKTeco\\ZKTime\\att2000.mdb"
        self.erp_api_url = erp_api_url or "http://localhost:5000/api"
        self.shift_start = "09:00:00"
        self.shift_end = "18:00:00"
        self.grace_period_mins = 15

    def get_employee_mapping(self):
        """
        Maps biometric device User IDs to ERP Employee records.
        """
        return {
            "101": {"emp_id": "EMP-001", "name": "Muhammad Ahmad", "dept": "Sales & Marketing", "branch": "Lahore"},
            "102": {"emp_id": "EMP-002", "name": "Usman Tariq", "dept": "Workshop & Biomedical", "branch": "Lahore"},
            "103": {"emp_id": "EMP-003", "name": "Bilal Khan", "dept": "Finance & Accounts", "branch": "Lahore"},
            "104": {"emp_id": "EMP-004", "name": "Zubair Shah", "dept": "Inventory & Logistics", "branch": "Peshawar"},
            "105": {"emp_id": "EMP-005", "name": "Farhan Ali", "dept": "Technical Support", "branch": "Multan"}
        }

    def fetch_raw_punches_mock(self, target_date=None):
        """
        Simulates / reads raw CHECKINOUT table logs from ZKTime database.
        Fields: USERID, CHECKTIME, CHECKTYPE (I = In, O = Out), VERIFYCODE (1=Finger, 15=Face)
        """
        if not target_date:
            target_date = datetime.now().strftime("%Y-%m-%d")

        return [
            {"userid": "101", "checktime": f"{target_date} 08:55:10", "type": "I", "device": "Device-01"},
            {"userid": "101", "checktime": f"{target_date} 18:05:22", "type": "O", "device": "Device-01"},
            {"userid": "102", "checktime": f"{target_date} 09:22:45", "type": "I", "device": "Device-01"}, # Late by 22 mins
            {"userid": "102", "checktime": f"{target_date} 19:30:15", "type": "O", "device": "Device-01"}, # Overtime
            {"userid": "103", "checktime": f"{target_date} 08:58:30", "type": "I", "device": "Device-01"},
            {"userid": "103", "checktime": f"{target_date} 18:10:00", "type": "O", "device": "Device-01"},
            {"userid": "104", "checktime": f"{target_date} 09:02:11", "type": "I", "device": "Device-02"},
            {"userid": "104", "checktime": f"{target_date} 13:30:00", "type": "O", "device": "Device-02"}, # Half Day
            {"userid": "105", "checktime": f"{target_date} 09:10:05", "type": "I", "device": "Device-03"}  # Missing Punch Out
        ]

    def process_daily_attendance(self, raw_logs, target_date=None):
        """
        Aggregates raw punch pairs, computes effective hours, late arrivals, overtime, and attendance status.
        """
        if not target_date:
            target_date = datetime.now().strftime("%Y-%m-%d")

        emp_map = self.get_employee_mapping()
        grouped = {}

        for log in raw_logs:
            uid = log["userid"]
            if uid not in grouped:
                grouped[uid] = []
            grouped[uid].append(datetime.strptime(log["checktime"], "%Y-%m-%d %H:%M:%S"))

        attendance_records = []
        fmt = "%Y-%m-%d %H:%M:%S"
        shift_in = datetime.strptime(f"{target_date} {self.shift_start}", fmt)
        shift_out = datetime.strptime(f"{target_date} {self.shift_end}", fmt)

        for uid, emp_info in emp_map.items():
            punches = sorted(grouped.get(uid, []))
            
            if not punches:
                # Absent
                attendance_records.append({
                    "date": target_date,
                    "biometric_id": uid,
                    "emp_id": emp_info["emp_id"],
                    "name": emp_info["name"],
                    "dept": emp_info["dept"],
                    "status": "Absent",
                    "clock_in": None,
                    "clock_out": None,
                    "work_hours": 0.0,
                    "late_minutes": 0,
                    "overtime_hours": 0.0,
                    "notes": "No biometric punch recorded"
                })
                continue

            first_in = punches[0]
            last_out = punches[-1] if len(punches) > 1 else None

            # Check late arrival
            late_delta = first_in - shift_in
            late_mins = max(0, int(late_delta.total_seconds() / 60))
            is_late = late_mins > self.grace_period_mins

            # Effective hours
            if last_out:
                duration = last_out - first_in
                hours_worked = round(duration.total_seconds() / 3600, 2)
            else:
                hours_worked = 0.0

            # Overtime check (after shift_out)
            ot_hours = 0.0
            if last_out and last_out > shift_out:
                ot_delta = last_out - shift_out
                ot_hours = round(max(0.0, ot_delta.total_seconds() / 3600), 2)

            # Determine attendance status
            if not last_out:
                status = "Missing Out-Punch"
                notes = "Operator clocked in but has no checkout punch"
            elif hours_worked < 5.0:
                status = "Half Day"
                notes = f"Worked {hours_worked} hrs (under minimum 5.0 hrs threshold)"
            else:
                status = "Present"
                notes = f"Late by {late_mins} mins" if is_late else "On Time"

            attendance_records.append({
                "date": target_date,
                "biometric_id": uid,
                "emp_id": emp_info["emp_id"],
                "name": emp_info["name"],
                "dept": emp_info["dept"],
                "status": status,
                "clock_in": first_in.strftime("%H:%M:%S"),
                "clock_out": last_out.strftime("%H:%M:%S") if last_out else None,
                "work_hours": hours_worked,
                "late_minutes": late_mins if is_late else 0,
                "overtime_hours": ot_hours,
                "notes": notes
            })

        return attendance_records

    def run_sync(self, date_str=None):
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")
        print(f"[*] Starting ZKTime Synchronization for Date: {date_str}...")
        raw_logs = self.fetch_raw_punches_mock(date_str)
        print(f"[*] Fetched {len(raw_logs)} raw biometric check-in/out logs.")
        results = self.process_daily_attendance(raw_logs, date_str)
        print(f"[+] Processed {len(results)} employee daily attendance records.")
        return results

if __name__ == "__main__":
    sync = ZKTimeSynchronizer()
    res = sync.run_sync()
    print(json.dumps(res, indent=2))
