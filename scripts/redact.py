#!/usr/bin/env python3
"""Local redaction of identifiers from a text file before any model sees it.

Usage:  python3 scripts/redact.py INPUT.txt [OUTPUT.txt] [--name "Full Name"]... [--keep-dates]
Default output: .scratch/redacted/<input name>.redacted.txt
Scans PDFs/images first with:  ocrmypdf --force-ocr in.pdf out.pdf && pdftotext out.pdf in.txt

Catches: emails, phone numbers, Aadhaar/PAN/SSN-like IDs, labelled fields (patient, name,
relatives, doctor, hospital, address, MRN/UHID/IDs, DOB), "Dr. X", dates (unless --keep-dates),
plus every --name you pass. Keeps age, sex and all test values.
It can NOT find a name inside free text: always read the output once before sharing it.
"""
import argparse, collections, pathlib, re, sys

LABELS = (r"patient(?:'s)?(?:\s+name)?|name|father(?:'s)?(?:\s+name)?|mother(?:'s)?(?:\s+name)?|spouse|husband|wife|guardian|"
          r"relative|referred\s+by|referring\s+doctor|ref\.?\s+by|doctor|consultant|physician|pathologist|technician|signed\s+by|"
          r"lab(?:oratory)?|hospital|clinic|centre|center|address|city|phone|mobile|tel|contact|e-?mail|"
          r"mrn|uhid|patient\s+id|pid|reg(?:istration)?\.?\s*(?:no|number|id)|sample\s+(?:id|no)|accession(?:\s+no)?|"
          r"barcode|bill\s+no|invoice(?:\s+no)?|ref(?:erence)?\.?\s*(?:no|number)|visit\s+(?:id|no)|ip\s*no|op\s*no|"
          r"insurance(?:\s+id)?|policy\s+no|aadhaar|aadhar|pan|ssn|passport|date\s+of\s+birth|d\.?o\.?b\.?")
LABELLED = re.compile(rf"(?im)^(?P<pre>[ \t>*|-]*(?P<label>{LABELS})\s*[:\-=]\s*)(?P<val>[^\n|]+)")
RULES = [
    ("email", re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+"), "[EMAIL]"),
    ("phone", re.compile(r"(?<![\w.])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)|(?<![\w.])\+\d{1,3}[\s-]?\d[\d\s-]{8,13}\d"), "[PHONE]"),
    ("aadhaar", re.compile(r"(?<!\d)\d{4}\s\d{4}\s\d{4}(?!\d)"), "[ID]"),
    ("pan", re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b"), "[ID]"),
    ("ssn", re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "[ID]"),
    ("doctor", re.compile(r"\bDr\.?\s+[A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*){0,3}"), "[DOCTOR]"),
]
DATES = re.compile(r"(?<![\d.])(?:(?:0?[1-9]|[12]\d|3[01])(?P<s>[/.-])(?:0?[1-9]|1[0-2])(?P=s)(?:\d{4}|\d{2}(?!\d))|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s+\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b", re.I)

def redact(text, names=(), keep_dates=False):
    counts = collections.Counter()
    def labelled(m):
        label = re.sub(r"\s+", " ", m.group("label").strip().upper())
        counts["field:" + label.lower()] += 1
        return f"{m.group('pre')}[REDACTED {label}]"
    text = LABELLED.sub(labelled, text)
    for n in names:
        if n.strip():
            text, k = re.subn(re.escape(n.strip()).replace(r"\ ", r"\s+"), "[NAME]", text, flags=re.I)
            counts["name"] += k
    for key, rx, rep in RULES:
        text, k = rx.subn(rep, text)
        counts[key] += k
    if not keep_dates:
        text, k = DATES.subn("[DATE]", text)
        counts["date"] += k
    return text, counts

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input"); ap.add_argument("output", nargs="?")
    ap.add_argument("--name", action="append", default=[]); ap.add_argument("--keep-dates", action="store_true")
    a = ap.parse_args()
    src = pathlib.Path(a.input)
    out = pathlib.Path(a.output) if a.output else pathlib.Path(".scratch/redacted") / (src.name + ".redacted.txt")
    out.parent.mkdir(parents=True, exist_ok=True)
    text, counts = redact(src.read_text(errors="replace"), a.name, a.keep_dates)
    out.write_text(text)
    print(f"wrote {out}")
    print("redacted: " + (", ".join(f"{k} x{v}" for k, v in sorted(counts.items()) if v) or "nothing found"))
    print("Names inside free text are NOT detected: read the file once, then share only this copy.")

if __name__ == "__main__":
    main()
