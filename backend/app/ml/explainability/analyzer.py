class DefectAnalyzer:
    def __init__(self):
        self.severity_map = {
            "Clean": "Low",
            "Dust": "Medium",
            "Discoloration": "Medium",
            "Crack": "High",
            "Delamination": "High",
            "Hotspot": "Critical",
            "Broken Cell": "Critical",
            "Corrosion": "Critical"
        }
        
        self.recommendation_map = {
            "Clean": "No action required. Continue regular monitoring.",
            "Dust": "Schedule automated or manual panel cleaning. Monitor for efficiency improvements.",
            "Discoloration": "Log defect and monitor over next 3-6 months. No immediate action required.",
            "Crack": "Inspect affected panel physically to determine structural integrity. Consider replacement if power output drops >5%.",
            "Delamination": "High risk of moisture ingress. Schedule for replacement during next maintenance cycle.",
            "Hotspot": "URGENT: Schedule thermal inspection and electrical testing immediately. High risk of localized fire or catastrophic failure.",
            "Broken Cell": "URGENT: Replace panel immediately to prevent string mismatch losses and safety hazards.",
            "Corrosion": "URGENT: Inspect connectors and grounding. Clean or replace corroded parts immediately to prevent arc faults."
        }

    def analyze_defect(self, predicted_class: str, confidence: float, defect_area_ratio: float = None) -> dict:
        """
        Analyzes the defect and returns severity and recommendation.
        If defect_area_ratio is provided (e.g. from localization), it can adjust severity.
        """
        base_severity = self.severity_map.get(predicted_class, "Unknown")
        recommendation = self.recommendation_map.get(predicted_class, "Consult maintenance manual.")
        
        # Adjust severity based on confidence and area if applicable
        adjusted_severity = base_severity
        
        if base_severity == "High" and confidence > 0.95:
            adjusted_severity = "Critical"
            
        if defect_area_ratio is not None:
            if defect_area_ratio > 0.3 and base_severity in ["Medium", "High"]:
                adjusted_severity = "Critical"
                recommendation += " Note: Defect covers a large area (>30%)."
                
        return {
            "severity": adjusted_severity,
            "recommendation": recommendation
        }
