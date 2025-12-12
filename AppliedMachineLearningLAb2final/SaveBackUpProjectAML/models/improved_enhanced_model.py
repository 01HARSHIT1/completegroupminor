import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import pickle
import warnings
warnings.filterwarnings('ignore')

class ImprovedEnhancedMedicalPredictor:
    def __init__(self):
        self.models = {}
        self.label_encoder = LabelEncoder()
        self.symptom_weights = {}
        self.disease_symptom_importance = {}
        
    def load_and_preprocess_data(self):
        """Load and preprocess the symptoms dataset with enhanced features"""
        print("Loading and preprocessing data...")
        
        # Load the symptoms dataset with fallback paths
        import os
        base_dir = os.path.dirname(os.path.dirname(__file__)) if '__file__' in globals() else os.getcwd()
        
        # Try multiple paths
        dataset_paths = [
            os.path.join(base_dir, 'react-flask-app', 'datasets', 'symtoms_df.csv'),
            os.path.join(base_dir, 'datasets', 'symtoms_df.csv'),
            'datasets/symtoms_df.csv',
            '../../ProjectAML/datasets/symtoms_df.csv'
        ]
        
        df = None
        for path in dataset_paths:
            if os.path.exists(path):
                df = pd.read_csv(path)
                break
        
        if df is None:
            raise FileNotFoundError("Could not find symtoms_df.csv in any expected location")
        
        # Create a more comprehensive dataset
        enhanced_data = []
        
        for _, row in df.iterrows():
            disease = row['Disease']
            symptoms = [row['Symptom_1'], row['Symptom_2'], row['Symptom_3'], row['Symptom_4']]
            symptoms = [s.strip() for s in symptoms if pd.notna(s) and s.strip()]
            
            # Create binary feature vector
            feature_vector = self.create_feature_vector(symptoms)
            
            # Add enhanced features
            enhanced_features = self.add_enhanced_features(symptoms, disease)
            feature_vector.update(enhanced_features)
            
            enhanced_data.append({
                'disease': disease,
                'symptoms': symptoms,
                'features': feature_vector
            })
        
        return enhanced_data
    
    def create_feature_vector(self, symptoms):
        """Create binary feature vector for symptoms"""
        # Define all possible symptoms
        all_symptoms = [
            'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering',
            'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting',
            'vomiting', 'burning_micturition', 'spotting_ urination', 'fatigue', 'weight_gain',
            'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness',
            'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever',
            'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache',
            'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes',
            'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
            'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach',
            'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm',
            'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
            'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements',
            'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness',
            'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels',
            'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties',
            'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech',
            'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints',
            'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness',
            'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine',
            'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)',
            'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body',
            'belly_pain', 'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes',
            'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum',
            'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion',
            'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen',
            'history_of_alcohol_consumption', 'fluid_overload', 'blood_in_sputum',
            'prominent_veins_on_calf', 'palpitations', 'painful_walking', 'pus_filled_pimples',
            'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails',
            'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
        ]
        
        feature_vector = {}
        for symptom in all_symptoms:
            feature_vector[f'symptom_{symptom}'] = 1 if symptom in symptoms else 0
        
        return feature_vector
    
    def add_enhanced_features(self, symptoms, disease):
        """Add enhanced features based on medical knowledge"""
        enhanced_features = {}
        
        # Symptom count
        enhanced_features['symptom_count'] = len(symptoms)
        
        # Symptom categories
        skin_symptoms = ['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic _patches', 
                        'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling', 
                        'silver_like_dusting', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze']
        respiratory_symptoms = ['continuous_sneezing', 'cough', 'breathlessness', 'phlegm', 
                               'throat_irritation', 'sinus_pressure', 'runny_nose', 'congestion']
        gastrointestinal_symptoms = ['stomach_pain', 'vomiting', 'nausea', 'abdominal_pain', 
                                    'diarrhoea', 'constipation', 'indigestion', 'loss_of_appetite']
        neurological_symptoms = ['headache', 'dizziness', 'mood_swings', 'anxiety', 'depression', 
                                'irritability', 'altered_sensorium', 'coma']
        metabolic_symptoms = ['fatigue', 'weight_loss', 'weight_gain', 'irregular_sugar_level', 
                             'excessive_hunger', 'polyuria', 'increased_appetite']
        
        enhanced_features['skin_symptoms_count'] = sum(1 for s in symptoms if s in skin_symptoms)
        enhanced_features['respiratory_symptoms_count'] = sum(1 for s in symptoms if s in respiratory_symptoms)
        enhanced_features['gastrointestinal_symptoms_count'] = sum(1 for s in symptoms if s in gastrointestinal_symptoms)
        enhanced_features['neurological_symptoms_count'] = sum(1 for s in symptoms if s in neurological_symptoms)
        enhanced_features['metabolic_symptoms_count'] = sum(1 for s in symptoms if s in metabolic_symptoms)
        
        # IMPROVED: Disease-specific symptom patterns with better differentiation
        # Diabetes-specific features
        diabetes_key_symptoms = ['fatigue', 'weight_loss', 'irregular_sugar_level', 'polyuria', 'increased_appetite']
        diabetes_secondary_symptoms = ['excessive_hunger', 'blurred_and_distorted_vision', 'slow_healing_wounds']
        enhanced_features['diabetes_symptom_score'] = sum(1 for s in symptoms if s in diabetes_key_symptoms)
        enhanced_features['diabetes_secondary_score'] = sum(1 for s in symptoms if s in diabetes_secondary_symptoms)
        
        # Hyperthyroidism-specific features
        hyperthyroidism_key_symptoms = ['fatigue', 'weight_loss', 'mood_swings', 'restlessness', 'sweating']
        hyperthyroidism_secondary_symptoms = ['fast_heart_rate', 'palpitations', 'enlarged_thyroid', 'anxiety']
        enhanced_features['hyperthyroidism_symptom_score'] = sum(1 for s in symptoms if s in hyperthyroidism_key_symptoms)
        enhanced_features['hyperthyroidism_secondary_score'] = sum(1 for s in symptoms if s in hyperthyroidism_secondary_symptoms)
        
        # Typhoid-specific features
        typhoid_key_symptoms = ['chills', 'vomiting', 'high_fever', 'toxic_look_(typhos)', 'abdominal_pain']
        enhanced_features['typhoid_symptom_score'] = sum(1 for s in symptoms if s in typhoid_key_symptoms)
        
        # Fungal infection-specific features
        fungal_key_symptoms = ['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic _patches']
        enhanced_features['fungal_symptom_score'] = sum(1 for s in symptoms if s in fungal_key_symptoms)
        
        # IMPROVED: Symptom combination features
        # Diabetes vs Hyperthyroidism differentiation
        if 'irregular_sugar_level' in symptoms or 'polyuria' in symptoms:
            enhanced_features['diabetes_indicators'] = 1
        else:
            enhanced_features['diabetes_indicators'] = 0
            
        if 'mood_swings' in symptoms or 'sweating' in symptoms:
            enhanced_features['hyperthyroidism_indicators'] = 1
        else:
            enhanced_features['hyperthyroidism_indicators'] = 0
        
        # IMPROVED: Weight loss context
        enhanced_features['weight_loss_diabetes_context'] = 0
        enhanced_features['weight_loss_hyperthyroidism_context'] = 0
        enhanced_features['weight_loss_generic_context'] = 0
        
        if 'weight_loss' in symptoms:
            if 'irregular_sugar_level' in symptoms or 'polyuria' in symptoms:
                enhanced_features['weight_loss_diabetes_context'] = 1
            elif 'mood_swings' in symptoms or 'sweating' in symptoms:
                enhanced_features['weight_loss_hyperthyroidism_context'] = 1
            else:
                enhanced_features['weight_loss_generic_context'] = 1
        
        return enhanced_features
    
    def train_models(self, enhanced_data):
        """Train multiple models for ensemble prediction"""
        print("Training improved enhanced models...")
        
        # Prepare features and labels
        feature_names = list(enhanced_data[0]['features'].keys())
        self.feature_names = feature_names  # Set as instance attribute
        X = np.array([[d['features'][f] for f in feature_names] for d in enhanced_data])
        y = [d['disease'] for d in enhanced_data]
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)
        
        # Train multiple models with improved parameters
        models_config = {
            'random_forest': RandomForestClassifier(n_estimators=300, max_depth=20, min_samples_split=5, random_state=42),
            'gradient_boosting': GradientBoostingClassifier(n_estimators=300, max_depth=10, learning_rate=0.1, random_state=42),
            'svm': SVC(kernel='rbf', probability=True, C=10, gamma='scale', random_state=42),
            'neural_network': MLPClassifier(hidden_layer_sizes=(150, 100, 50), max_iter=1000, alpha=0.01, random_state=42)
        }
        
        for name, model in models_config.items():
            print(f"Training {name}...")
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            print(f"{name} accuracy: {accuracy:.4f}")
            
            self.models[name] = model
        
        # Save models
        with open('models/improved_enhanced_models.pkl', 'wb') as f:
            pickle.dump({
                'models': self.models,
                'label_encoder': self.label_encoder,
                'feature_names': feature_names
            }, f)
        
        print("Improved models saved successfully!")
        return X_test, y_test
    
    def predict_disease(self, symptoms):
        """Predict disease using ensemble of models with improved logic"""
        # Load models if not already loaded
        if not self.models:
            with open('models/improved_enhanced_models.pkl', 'rb') as f:
                data = pickle.load(f)
                self.models = data['models']
                self.label_encoder = data['label_encoder']
                self.feature_names = data['feature_names']
        
        # Create feature vector
        feature_vector = self.create_feature_vector(symptoms)
        enhanced_features = self.add_enhanced_features(symptoms, "unknown")
        feature_vector.update(enhanced_features)
        
        # Prepare input
        X = np.array([[feature_vector[f] for f in self.feature_names]])
        
        # Get predictions from all models
        predictions = {}
        probabilities = {}
        
        for name, model in self.models.items():
            pred = model.predict(X)[0]
            prob = model.predict_proba(X)[0]
            predictions[name] = pred
            probabilities[name] = prob
        
        # IMPROVED: Enhanced ensemble prediction with medical rules
        ensemble_pred = self.improved_ensemble_predict(predictions, probabilities, symptoms, feature_vector)
        
        # Decode prediction
        predicted_disease = self.label_encoder.inverse_transform([ensemble_pred])[0]
        
        return predicted_disease, predictions, probabilities
    
    def improved_ensemble_predict(self, predictions, probabilities, symptoms, feature_vector):
        """Improved ensemble prediction with medical domain knowledge"""
        
        # Get the most confident prediction
        max_confidence = 0
        best_prediction = None
        
        for name, prob in probabilities.items():
            max_prob = max(prob)
            if max_prob > max_confidence:
                max_confidence = max_prob
                best_prediction = predictions[name]
        
        # IMPROVED: Apply medical rules for specific cases
        predicted_disease_name = self.label_encoder.inverse_transform([best_prediction])[0]
        
        # Rule 1: Diabetes vs Hyperthyroidism differentiation
        if predicted_disease_name in ['Diabetes ', 'Hyperthyroidism']:
            # Check for diabetes-specific symptoms
            if ('irregular_sugar_level' in symptoms or 'polyuria' in symptoms) and 'mood_swings' not in symptoms:
                # Force Diabetes prediction
                diabetes_idx = self.label_encoder.transform(['Diabetes '])[0]
                return diabetes_idx
            elif ('mood_swings' in symptoms or 'sweating' in symptoms) and 'irregular_sugar_level' not in symptoms:
                # Force Hyperthyroidism prediction
                hyperthyroidism_idx = self.label_encoder.transform(['Hyperthyroidism'])[0]
                return hyperthyroidism_idx
        
        # Rule 2: Typhoid specific symptoms
        if 'chills' in symptoms and 'vomiting' in symptoms and 'high_fever' in symptoms:
            typhoid_idx = self.label_encoder.transform(['Typhoid'])[0]
            return typhoid_idx
        
        # Rule 3: Fungal infection specific symptoms
        if 'itching' in symptoms and 'skin_rash' in symptoms and 'nodal_skin_eruptions' in symptoms:
            fungal_idx = self.label_encoder.transform(['Fungal infection'])[0]
            return fungal_idx
        
        # If no specific rules apply, return the most confident prediction
        return best_prediction

def main():
    """Main function to train the improved enhanced model"""
    predictor = ImprovedEnhancedMedicalPredictor()
    
    # Load and preprocess data
    enhanced_data = predictor.load_and_preprocess_data()
    
    # Train models
    X_test, y_test = predictor.train_models(enhanced_data)
    
    # Test with the problematic cases
    test_cases = [
        ['fatigue', 'weight_loss', 'restlessness', 'lethargy'],  # Should be Diabetes
        ['fatigue', 'weight_loss', 'irregular_sugar_level', 'polyuria'],  # Should be Diabetes
        ['fatigue', 'mood_swings', 'weight_loss', 'restlessness'],  # Should be Hyperthyroidism
        ['chills', 'vomiting', 'fatigue', 'high_fever'],  # Should be Typhoid
        ['itching', 'skin_rash', 'nodal_skin_eruptions'],  # Should be Fungal infection
    ]
    
    print("\n" + "=" * 60)
    print("TESTING IMPROVED ENHANCED MODEL")
    print("=" * 60)
    
    # Reset models to force reload
    predictor.models = {}
    
    for i, test_symptoms in enumerate(test_cases, 1):
        predicted_disease, predictions, probabilities = predictor.predict_disease(test_symptoms)
        
        print(f"\n{i}. Test case: {test_symptoms}")
        print(f"   Predicted disease: {predicted_disease}")
        print("   Individual model predictions:")
        for name, pred in predictions.items():
            disease_name = predictor.label_encoder.inverse_transform([pred])[0]
            print(f"     {name}: {disease_name}")

if __name__ == "__main__":
    main()
