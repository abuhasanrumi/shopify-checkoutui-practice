import { useExtensionApi, BlockStack, Heading, Grid, InlineStack, Image, Text, TextBlock } from '@shopify/checkout-ui-extensions-react';
import { fullStarSVG, halfStarSVG, emptyStarSVG, avatar } from '../utils/icons.js';

export default function Review({ data }) {
    const { extensionPoint } = useExtensionApi()
    const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)
    const rating = widgetData?.user?.ratings || 4.5
    const fullStar = Math.floor(rating)
    const halfStar = Math.ceil(rating - fullStar)
    const emptyStar = 5 - (fullStar + halfStar)

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