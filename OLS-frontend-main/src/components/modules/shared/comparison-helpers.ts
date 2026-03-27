import type { CardConfig } from '../types';
import type { ComparisonConfig, ComparisonField } from './comparison-panel';

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON HELPERS - Utility functions for comparison functionality
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a ComparisonConfig from a CardConfig
 * This ensures DRY - we reuse the same field definitions
 */
export function createComparisonConfigFromCard<T>(
  cardConfig: CardConfig<T>,
  additionalFields?: ComparisonField<T>[]
): ComparisonConfig<T> {
  const fields: ComparisonField<T>[] = [];

  // Add badge fields
  if (cardConfig.badges) {
    for (const badge of cardConfig.badges) {
      fields.push({
        key: badge.key,
        label: badge.fullLabel || badge.label || String(badge.key),
        render: badge.render,
        category: 'classification',
      });
    }
  }

  // Add info fields
  if (cardConfig.infoFields) {
    for (const info of cardConfig.infoFields) {
      fields.push({
        key: info.key,
        label: info.fullLabel || info.label || String(info.key),
        render: info.render,
        category: 'characteristics',
      });
    }
  }

  // Add description field
  if (cardConfig.descriptionField) {
    fields.push({
      key: cardConfig.descriptionField,
      label: cardConfig.descriptionLabel || String(cardConfig.descriptionField),
      category: 'general',
    });
  }

  // Add any additional fields
  if (additionalFields) {
    fields.push(...additionalFields);
  }

  return {
    titleField: cardConfig.titleField,
    subtitleField: cardConfig.subtitleField,
    fields,
  };
}
