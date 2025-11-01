import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle} from "../ui/card"
import { useI18n } from "@/contexts/I18nContext"
import { Badge } from "../ui/badge"
import { BarChart3 } from "lucide-react"
export default function Statistics({statsLoading, statistics}) {
    const {getTranslation, language} = useI18n()
    return statsLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : statistics?.overview?.totalItems > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation('overviewStats', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{getTranslation('totalItems', language)}</p>
                  <p className="text-2xl font-bold">{statistics.overview.totalItems}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{getTranslation('itemsLast7Days', language)}</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.overview.itemsLast7Days}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{getTranslation('itemsLast30Days', language)}</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.overview.itemsLast30Days}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{getTranslation('averageItemsPerDay', language)}</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.overview.averageItemsPerDay}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{getTranslation('likes', language)}</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.overview.totalLikes}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{getTranslation('totalDiscussions', language)}</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.overview.totalDiscussions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation('topContributors', language)}</CardTitle>
                <p className="text-sm text-muted-foreground">{getTranslation('contributorsDescription', language)}</p>
              </CardHeader>
              <CardContent>
                {statistics.topContributors.length > 0 ? (
                  <div className="space-y-3">
                    {statistics.topContributors.map((contributor, index) => (
                      <div key={contributor.user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <Link
                            to={`/profile/${contributor.user.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {contributor.user.name || contributor.user.email}
                          </Link>
                        </div>
                        <Badge variant="secondary">{contributor.itemCount} {getTranslation('items', language)}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{getTranslation('noItems', language)}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{getTranslation('recentItems', language)}</CardTitle>
                <p className="text-sm text-muted-foreground">{getTranslation('recentItemsDescription', language)}</p>
              </CardHeader>
              <CardContent>
                {statistics.recentItems.length > 0 ? (
                  <div className="space-y-3">
                    {statistics.recentItems.map((item) => (
                      <Link
                        key={item.id}
                        to={`/item/${item.id}`}
                        className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-mono font-medium text-sm">{item.customId || item.id.substring(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.user.name || item.user.email}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{getTranslation('noItems', language)}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('statistics', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {getTranslation('noStatsData', language)}
              </h3>
              <p className="text-muted-foreground">
                {getTranslation('noStatsDescription', language)}
              </p>
            </div>
          </CardContent>
        </Card>
      )
}
