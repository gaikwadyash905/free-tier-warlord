---
name: "Medical Document Analysis"
description: "Use for lab reports, imaging and pathology reports, discharge summaries, prescriptions, clinical papers and guidelines: private extraction, accurate tables, plain-language explanation, urgency flags, evidence appraisal. Informational, not diagnosis."
---

## 1. Privacy and scope (first)
Work on a redacted copy in `.scratch/`: delete name, DOB, address, phone, e-mail, MRN/insurance/patient IDs, clinician and facility names. Keep age band, sex, units and dates relative ("day 0, day 14"). Do not use memory tools or web queries with identifiers. Tell the user once that the endpoint may log prompts.

## 2. Extraction
- Text PDF: `pdftotext -layout file.pdf -` or `python -c "import pdfplumber"` for tables. Scanned PDF/image: `ocrmypdf` or `tesseract` (`-l eng --psm 6`), then compare each number against the image where possible.
- Build a structured table first (CSV/JSON in `.scratch/`): test, value, unit, reference range, flag, specimen, date. Re-read every number against the source; check unit consistency (mg/dL vs mmol/L: glucose x0.0555, cholesterol x0.0259, creatinine x88.4 umol/L per mg/dL) and decimal placement. Mark doubtful values `UNCERTAIN`.

## 3. Interpretation
- Use the report's ranges; else generic adult ranges labelled as such. Distinguish out-of-range from clinically significant; consider biological variation, fasting state, hemolysis, medication and supplement effects (biotin interferes with many immunoassays), time of day, pregnancy, age and sex.
- Read panels as patterns, not isolated numbers: CBC (MCV with Hb and ferritin; WBC differential; platelets), metabolic panel (anion gap, BUN/creatinine, calcium with albumin), liver (ALT/AST pattern vs ALP/GGT, bilirubin fractions), lipids (non-HDL, ApoB), glycaemia (HbA1c with fasting glucose, mind anaemia and haemoglobin variants), thyroid (TSH with fT4), iron studies, inflammatory markers, urinalysis, coagulation, tumour markers (low specificity; never conclusive alone).
- Imaging/pathology: restate the impression verbatim, explain terms and classification systems (BI-RADS, LI-RADS, TI-RADS, Lung-RADS, Fazekas, TNM, Gleason/ISUP, Bethesda) and what each category usually triggers, and the difference between "no acute abnormality", "incidental finding" and "recommend follow-up".
- Trends: compute change and percent change, flag direction and speed, plot to `.scratch/` when helpful.
- Critical values needing prompt medical contact include (non-exhaustive): potassium <3.0 or >6.0 mmol/L, sodium <125 or >155, glucose <3.0 mmol/L (54 mg/dL) or >27.8 (500 mg/dL), Hb <70 g/L, platelets <20, INR >5, troponin above the 99th percentile with symptoms, positive blood cultures. Any "critical", "urgent", "immediate" wording in the report counts.

## 4. Papers, guidelines, drug information
Appraise: design, population, comparator, outcomes (patient-important vs surrogate), absolute vs relative risk, confidence interval, NNT/NNH, risk of bias (RoB 2 / Newcastle-Ottawa), conflicts of interest, applicability, consistency with guidelines (cite society, year). Prefer systematic reviews, major guidelines (WHO, NICE, ESC, ADA, ACC/AHA, ICMR, CDC), regulator labels; give publication dates. Rate certainty (GRADE: high/moderate/low/very low).

## 5. Boundaries
No diagnosis, no medicine starting/stopping/dosing, no second-guessing a clinician's plan beyond raising questions. Provide red flags and when to seek care. Say what additional information (history, symptoms, medications, earlier results) would change the interpretation.
