import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadStoredSettings();
  }, []);

  const loadStoredSettings = async () => {
    try {
      const currentValue = await AsyncStorage.getItem('currentScanConfig');
      if (currentValue) {
        setStoredValue(currentValue);
        // Parse the stored value back into selections
        const daySession = currentValue.split('_');
        const day = parseInt(daySession[0].replace('day', ''));
        const session = daySession[1];
        setSelections(prev => ({
          ...prev,
          day,
          session
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const combinedValue = `day${selections.day}_${selections.session}_${selections.gate}`;
      await AsyncStorage.setItem('currentScanConfig', combinedValue);
      setStoredValue(combinedValue);
      setCurrentStep(STEPS.SUMMARY);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelection = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
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
          {renderCurrentStep()}
          {currentStep !== STEPS.SUMMARY && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === STEPS.DAY}
            >
              <Text style={styles.backButtonText}>Back</Text>
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
  },
  backButtonText: {
    color: '#666',
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
});