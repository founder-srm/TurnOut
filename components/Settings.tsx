import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STEPS = {
  DAY: 0,
  SESSION: 1,
  GATE: 2,
  SUMMARY: 3
};

const DAYS = [1, 2, 3, 4, 5];
const SESSIONS = ['fn', 'an'];
const GATES = ['in', 'out'];

export default function Settings() {
  const [currentStep, setCurrentStep] = useState(STEPS.DAY);
  const [selections, setSelections] = useState({
    day: null,
    session: null,
    gate: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storedValue, setStoredValue] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredSettings();
  }, []);

  useEffect(() => {
    console.log('Selections changed:', selections);
  }, [selections]);

  const handleBack = () => {
    setError(null); // Clear errors when going back
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const loadStoredSettings = async () => {
    try {
      setError(null); // Clear any previous errors
      const currentValue = await AsyncStorage.getItem('currentScanConfig');
      if (currentValue) {
        setStoredValue(currentValue);
        // Safely parse the stored value with validation
        const daySession = currentValue.split('_');
        if (daySession.length >= 2) {
          const day = parseInt(daySession[0].replace('day', ''));
          const session = daySession[1];
          const gate = daySession[2] || null; // Handle gate if present
          
          // Validate values before setting
          if (DAYS.includes(day) && SESSIONS.includes(session)) {
            setSelections({
              day,
              session,
              gate: GATES.includes(gate) ? gate : null
            });
            
            // If we have complete valid data, show the summary
            if (GATES.includes(gate)) {
              setCurrentStep(STEPS.SUMMARY);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Use a callback to get the most recent selections
      setSelections(currentSelections => {
        if (!currentSelections.day || !currentSelections.session || !currentSelections.gate) {
          throw new Error('Please complete all selections before saving');
        }

        const combinedValue = `day${currentSelections.day}_${currentSelections.session}_${currentSelections.gate}`;
        
        // Use an IIFE to handle the async operation
        (async () => {
          try {
            await AsyncStorage.setItem('currentScanConfig', combinedValue);
            setStoredValue(combinedValue);
            setCurrentStep(STEPS.SUMMARY);
          } catch (error) {
            console.error('Error saving to AsyncStorage:', error);
            setError('Failed to save settings. Please try again.');
          } finally {
            setSaving(false);
          }
        })();

        return currentSelections; // Return the current selections unchanged
      });
    } catch (error) {
      console.error('Error in saveSettings:', error);
      setError(error.message || 'Failed to save settings. Please try again.');
      setCurrentStep(STEPS.GATE);
      setSaving(false);
    }
  }, []);

  const handleSelection = (key, value) => {
    setError(null);
    setSelections(prev => {
      const newSelections = { ...prev, [key]: value };
      console.log('New selections:', newSelections);
      return newSelections;
    });
    if (currentStep < STEPS.GATE) {
      setCurrentStep(prev => prev + 1);
    } else {
      saveSettings();
    }
  };

  

  const renderDaySelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Day</Text>
      <View style={styles.optionsGrid}>
        {DAYS.map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.option,
              selections.day === day && styles.selectedOption
            ]}
            onPress={() => handleSelection('day', day)}
          >
            <Text style={[
              styles.optionText,
              selections.day === day && styles.selectedOptionText
            ]}>
              Day {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSessionSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Session</Text>
      <View style={styles.optionsGrid}>
        {SESSIONS.map(session => (
          <TouchableOpacity
            key={session}
            style={[
              styles.option,
              selections.session === session && styles.selectedOption
            ]}
            onPress={() => handleSelection('session', session)}
          >
            <Text style={[
              styles.optionText,
              selections.session === session && styles.selectedOptionText
            ]}>
              {session.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGateSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Gate</Text>
      <View style={styles.optionsGrid}>
        {GATES.map(gate => (
          <TouchableOpacity
            key={gate}
            style={[
              styles.option,
              selections.gate === gate && styles.selectedOption
            ]}
            onPress={() => handleSelection('gate', gate)}
          >
            <Text style={[
              styles.optionText,
              selections.gate === gate && styles.selectedOptionText
            ]}>
              {gate.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Settings Saved</Text>
      <View style={styles.summaryContainer}>
        <Text style={styles.configText}>Current Configuration:</Text>
        <Text style={styles.storedValueText}>{storedValue}</Text>
        <View style={styles.divider} />
        <Text style={styles.summaryText}>Day: {selections.day}</Text>
        <Text style={styles.summaryText}>Session: {selections.session?.toUpperCase()}</Text>
        <Text style={styles.summaryText}>Gate: {selections.gate?.toUpperCase()}</Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setCurrentStep(STEPS.DAY)}
      >
        <Text style={styles.editButtonText}>Edit Settings</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const renderCurrentStep = () => {
  console.log('Current step:', currentStep, 'Current selections:', selections);
  switch (currentStep) {
    case STEPS.DAY:
      return renderDaySelection();
    case STEPS.SESSION:
      return renderSessionSelection();
    case STEPS.GATE:
      return renderGateSelection();
    case STEPS.SUMMARY:
      return renderSummary();
    default:
      return null;
  }
};

  const renderError = () => error && (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {saving ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <>
          <View style={styles.progressContainer}>
            {Object.values(STEPS).slice(0, -1).map((step, index) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  currentStep >= step && styles.progressDotActive
                ]}
              />
            ))}
          </View>
          {renderError()}
          {renderCurrentStep()}
          {currentStep !== STEPS.SUMMARY && (
            <TouchableOpacity
              style={[
                styles.backButton,
                currentStep === STEPS.DAY && styles.backButtonDisabled
              ]}
              onPress={handleBack}
              disabled={currentStep === STEPS.DAY}
            >
              <Text style={[
                styles.backButtonText,
                currentStep === STEPS.DAY && styles.backButtonTextDisabled
              ]}>Back</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#090909',
    width: '100%',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  progressDotActive: {
    backgroundColor: '#3498db',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  option: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#151718',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  optionText: {
    color: 'white',
    fontSize: 18,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    padding: 15,
    alignItems: 'center',
    color: 'white',
  },
  backButtonText: {
    color: '#f0f0f0',
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: '#151718',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    gap: 10,
  },
  configText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storedValueText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 10,
  },
  summaryText: {
    color: 'white',
    fontSize: 18,
  },
  editButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  errorContainer: {
    backgroundColor: '#ff000020',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  backButtonDisabled: {
    opacity: 0.5,
  },
  backButtonTextDisabled: {
    color: '#444',
  }
});