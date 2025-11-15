const toTrimmed = (value) => {
  if (typeof value === 'string') return value.trim()
  return value
}

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const formatDecimal = (value) => {
  if (value === null || value === undefined) return null
  return Number.parseFloat(value.toFixed(2))
}

const computeNumericStats = (values) => {
  const numericValues = values.map(toNumber).filter((value) => value !== null)
  if (!numericValues.length) {
    return {
      type: 'numeric',
      count: 0,
      nullCount: values.length,
      min: null,
      max: null,
      average: null,
      median: null,
      sum: null,
      sampleValues: []
    }
  }
  const sorted = [...numericValues].sort((a, b) => a - b)
  const sum = numericValues.reduce((acc, value) => acc + value, 0)
  const mid = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
  return {
    type: 'numeric',
    count: numericValues.length,
    nullCount: values.length - numericValues.length,
    min: formatDecimal(sorted[0]),
    max: formatDecimal(sorted[sorted.length - 1]),
    average: formatDecimal(sum / numericValues.length),
    median: formatDecimal(median),
    sum: formatDecimal(sum),
    sampleValues: sorted.slice(0, 5).map((value) => formatDecimal(value))
  }
}

const computeBooleanStats = (values) => {
  let trueCount = 0
  let falseCount = 0
  values.forEach((value) => {
    if (value === null || value === undefined) {
      return
    }
    const normalized =
      typeof value === 'boolean'
        ? value
        : ['true', '1', 'yes'].includes(String(value).toLowerCase())
    if (normalized) {
      trueCount += 1
    } else if (
      typeof value === 'boolean' ||
      ['false', '0', 'no'].includes(String(value).toLowerCase())
    ) {
      falseCount += 1
    }
  })
  const total = trueCount + falseCount
  const nullCount = values.length - total
  return {
    type: 'boolean',
    trueCount,
    falseCount,
    nullCount,
    truePercentage: total ? formatDecimal((trueCount / total) * 100) : null,
    falsePercentage: total ? formatDecimal((falseCount / total) * 100) : null
  }
}

const computeTextStats = (values) => {
  const cleaned = values
    .map((value) => toTrimmed(value ?? ''))
    .filter((value) => !!value)
  if (!cleaned.length) {
    return {
      type: 'text',
      count: 0,
      nullCount: values.length,
      uniqueValues: 0,
      mostFrequent: []
    }
  }
  const frequency = cleaned.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
  const ordered = Object.entries(frequency).sort((a, b) => b[1] - a[1])
  const total = cleaned.length
  return {
    type: 'text',
    count: total,
    nullCount: values.length - total,
    uniqueValues: ordered.length,
    mostFrequent: ordered.slice(0, 5).map(([value, count]) => ({
      value,
      count,
      percentage: formatDecimal((count / total) * 100)
    }))
  }
}

const computeStatsForType = (fieldType, values) => {
  if (fieldType === 'NUMERIC') return computeNumericStats(values)
  if (fieldType === 'BOOLEAN') return computeBooleanStats(values)
  return computeTextStats(values)
}

export const buildInventoryAggregations = (fields, fieldValues, totalItems) => {
  const grouped = fieldValues.reduce((acc, value) => {
    if (!acc[value.fieldId]) acc[value.fieldId] = []
    acc[value.fieldId].push(value.value)
    return acc
  }, {})
  const calculatedAt = new Date().toISOString()
  const aggregatedFields = fields.map((field) => {
    const stats = computeStatsForType(field.fieldType, grouped[field.id] || [])
    return {
      id: field.id,
      title: field.title,
      description: field.description,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      stats
    }
  })
  const summaryDefaults = {
    numeric: 0,
    boolean: 0,
    text: 0,
  }
  const typeCounts = aggregatedFields.reduce((acc, field) => {
    acc[field.stats.type] = (acc[field.stats.type] || 0) + 1
    return acc
  }, { ...summaryDefaults })
  return {
    fields: aggregatedFields,
    summary: {
      calculatedAt,
      totalItems,
      fieldCount: fields.length,
      numericFieldCount: typeCounts.numeric,
      booleanFieldCount: typeCounts.boolean,
      textFieldCount: typeCounts.text,
    }
  }
}

