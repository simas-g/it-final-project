import { useQuery } from '@tanstack/react-query'
import { fetchHomeData } from '@/queries/api'
import LoadingState from '@/components/home/LoadingState'
import LatestCollectionsSection from '@/components/home/LatestCollectionsSection'
import TrendingSection from '@/components/home/TrendingSection'
import TagsSection from '@/components/home/TagsSection'
import CallToActionSection from '@/components/home/CallToActionSection'

const Home = () => {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['homeData'],
    queryFn: fetchHomeData,
  })
  const latestInventories = data?.latestInventories || []
  const popularInventories = data?.popularInventories || []
  const tags = data?.tags || []
  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-12">
      <LatestCollectionsSection inventories={latestInventories} />
      <TrendingSection inventories={popularInventories} />
      <TagsSection tags={tags} />
      <CallToActionSection />
    </div>
  )
}

export default Home