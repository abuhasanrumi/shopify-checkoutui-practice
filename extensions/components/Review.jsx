import { useExtensionApi, useCartLines, useApplyCartLinesChange, BlockStack, Heading, Grid, InlineStack, Image, Text, TextBlock } from '@shopify/checkout-ui-extensions-react';
import { useEffect } from 'react';
import { fullStarSVG, halfStarSVG, emptyStarSVG, avatar } from './icons.js';

export default function Review({ data, includedTrue }) {
  const { extensionPoint } = useExtensionApi()
  const cartLines = useCartLines()
  const applyCartLinesChange = useApplyCartLinesChange()
  const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)
  const rating = widgetData?.user?.ratings || 4.5
  const fullStar = Math.floor(rating)
  const halfStar = Math.ceil(rating - fullStar)
  const emptyStar = 5 - (fullStar + halfStar)
  const includedTrueIds = []
  includedTrue?.current?.filter(i => i.position === extensionPoint)?.forEach(i => includedTrueIds.push(i.id))

  useEffect(async () => {
    const firstCartLineId = cartLines?.at(0)?.id
    let tempAttributes = structuredClone(cartLines?.at(0)?.attributes)
    let widgetNames = []
    try {
      widgetNames = JSON.parse(tempAttributes?.find(i => i.key === '__nvd-widget-names')?.value)
    } catch { }
    const filteredAttributes = tempAttributes.filter(i => i.key !== '__nvd-widget-names')
    widgetNames.push('Review')
    if (tempAttributes.length) {
      tempAttributes = [
        ...Array.from(filteredAttributes),
        { key: `__nvd-widget-names`, value: JSON.stringify(Array.from(new Set(widgetNames))) }
      ]
    } else {
      const tempArr = [
        { key: '__nvd-position', value: extensionPoint },
        { key: '__nvd-location', value: 'Checkout Page' },
        { key: '__nvd-wdg-id', value: data?.widgets?.at(0)?.id?.toString() },
        { key: '__nvd-sg-id', value: JSON.stringify([...new Set(includedTrueIds)]) },
        { key: `__nvd-widget-names`, value: JSON.stringify(Array.from(new Set(widgetNames))) }
      ]
      tempArr.forEach(i => tempAttributes.push(i))
    }
    console.log(tempAttributes)
    await applyCartLinesChange({
      id: firstCartLineId,
      type: 'updateCartLine',
      attributes: tempAttributes
    })
  }, [])

  return (
    <BlockStack border='base' borderRadius='base' borderWidth='base' padding='base'>
      <Heading level={3}>{widgetData?.title?.review}</Heading>
      <TextBlock>{widgetData?.user?.review}</TextBlock>
      <Grid columns={['10%', 'fill', '30%']} spacing='base' blockAlignment='center'>
        <Image
          source={widgetData?.user?.image || avatar}
          borderRadius='fullyRounded'
          aspectRatio={1}
          fit='cover'
        />
        <Text>{widgetData?.user?.name}</Text>
        <InlineStack inlineAlignment='end' spacing='extraTight'>
          {Array.from({ length: fullStar }).map(() => <Image key={crypto.randomUUID()} source={fullStarSVG} />)}
          {Array.from({ length: halfStar }).map(() => <Image key={crypto.randomUUID()} source={halfStarSVG} />)}
          {Array.from({ length: emptyStar }).map(() => <Image key={crypto.randomUUID()} source={emptyStarSVG} />)}
        </InlineStack>
      </Grid>
    </BlockStack>
  )
}
