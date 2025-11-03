import { Card, CardContent } from '@/components/ui/card'

const CardList = ({ data, renderCard, className = 'md:hidden' }) => {
  return (
    <div className={`${className} space-y-3`}>
      {data.map((item, index) => (
        <Card key={item.id || index} className="hover:shadow-md transition-shadow">
          <CardContent className="">
            {renderCard(item, index)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default CardList

