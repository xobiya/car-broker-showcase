import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/tokens';

type PageTitleProps = {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
};

export function PageTitle({ eyebrow, title, action }: PageTitleProps) {
  return (
    <View style={styles.row}>
      <View>
        {eyebrow ? (
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        ) : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
