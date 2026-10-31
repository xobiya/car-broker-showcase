import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/tokens';

type ComboDropdownProps = {
  label: string;
  value: string;
  onChangeText: (val: string) => void;
  options: string[];
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  containerStyle?: ViewStyle;
  error?: string;
  hint?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function ComboDropdown({
  label,
  value,
  onChangeText,
  options,
  placeholder,
  keyboardType = 'default',
  containerStyle,
  error,
  hint,
  autoCapitalize = 'words',
}: ComboDropdownProps) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const filteredOptions = value.trim()
    ? options.filter((opt) =>
        opt.toLowerCase().includes(value.toLowerCase().trim()),
      )
    : options;

  const handleSelect = (item: string) => {
    onChangeText(item);
    setIsOpen(false);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    onChangeText('');
    setIsOpen(true);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label & Toggle helper */}
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Toggle ${label} options`}
          onPress={() => setIsOpen(!isOpen)}
          hitSlop={8}
          style={styles.toggleHintBtn}
        >
          <Text style={[styles.toggleHintText, { color: colors.primary }]}>
            {isOpen ? 'Close list' : 'Select or type'}
          </Text>
        </Pressable>
      </View>

      {/* Input Box with Action Icons */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? '#1C212E' : colors.white,
            borderColor: error
              ? colors.red
              : isFocused || isOpen
              ? colors.primary
              : isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : colors.line,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || `Type or choose ${label.toLowerCase()}…`}
          placeholderTextColor={isDark ? '#6B7280' : '#9AA0A8'}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, { color: colors.ink }]}
        />

        {value.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear field"
            onPress={handleClear}
            hitSlop={6}
            style={styles.actionIcon}
          >
            <Ionicons
              name="close-circle"
              size={17}
              color={isDark ? '#8A92A6' : '#9CA3AF'}
            />
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isOpen ? 'Collapse options' : 'Expand options'}
          onPress={() => setIsOpen(!isOpen)}
          hitSlop={6}
          style={styles.chevronButton}
        >
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={isOpen ? colors.primary : colors.muted}
          />
        </Pressable>
      </View>

      {/* Error or Hint */}
      {error ? (
        <Text style={[styles.error, { color: colors.red }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text>
      ) : null}

      {/* Dropdown Options Popup List */}
      {isOpen && (
        <View
          style={[
            styles.dropdownCard,
            {
              backgroundColor: isDark ? '#181C28' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.line,
              shadowColor: '#000',
            },
          ]}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.scrollList}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => {
                const isSelected =
                  value.trim().toLowerCase() === item.toLowerCase();
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${item}`}
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? '#2C1B14'
                            : '#FFF3EB'
                          : 'transparent',
                        borderBottomColor: isDark
                          ? 'rgba(255, 255, 255, 0.05)'
                          : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? colors.primary : colors.ink,
                          fontWeight: isSelected ? '800' : '500',
                        },
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={17}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.customOptionWrap}>
                <Text style={[styles.customOptionText, { color: colors.muted }]}>
                  No direct preset match.
                </Text>
                {value.trim().length > 0 && (
                  <Pressable
                    onPress={() => {
                      setIsOpen(false);
                      Keyboard.dismiss();
                    }}
                    style={[
                      styles.useCustomBtn,
                      {
                        backgroundColor: isDark ? '#2C1B14' : '#FFF3EB',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.useCustomBtnText, { color: colors.primary }]}
                    >
                      Use custom: &quot;{value.trim()}&quot;
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleHintBtn: {
    paddingHorizontal: 4,
  },
  toggleHintText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  actionIcon: {
    padding: 4,
    marginRight: 2,
  },
  chevronButton: {
    padding: 6,
    marginLeft: 2,
  },
  error: {
    fontSize: 11.5,
    marginTop: 4,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },

  /* Dropdown Card */
  dropdownCard: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: radius.medium,
    maxHeight: 180,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  scrollList: {
    maxHeight: 180,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 13,
  },
  customOptionWrap: {
    padding: 14,
    alignItems: 'center',
  },
  customOptionText: {
    fontSize: 12,
    marginBottom: 8,
  },
  useCustomBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  useCustomBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
