export const formatDate = (dateString, t, language) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return t('justNow')
  if (diffMins === 1) return t('minutesAgo', { count: 1 })
  if (diffMins < 60) return t('minutesAgo', { count: diffMins })
  if (diffHours === 1) return t('hoursAgo', { count: 1 })
  if (diffHours < 24) return t('hoursAgo', { count: diffHours })
  if (diffDays === 1) return t('daysAgo', { count: 1 })
  if (diffDays < 7) return t('daysAgo', { count: diffDays })
  const locale = language === 'es' ? 'es-ES' : language === 'pl' ? 'pl-PL' : 'en-US'
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
