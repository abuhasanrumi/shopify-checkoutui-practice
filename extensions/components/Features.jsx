import { BlockLayout, Text, TextBlock, View, Grid, GridItem, Image, BlockStack } from '@shopify/checkout-ui-extensions-react';

const featuresIds = ['4b1dd2a9-e3bc-4a6b-aef4-24001e710e81', '1c9165a5-d6a2-44ad-bf0b-3ff0b224a6be']

export default function Features({ data }) {
  const widgetData = JSON.parse(data?.widgets?.at(0)?.widget_customization)

  return (
    <>
      <BlockLayout border='base' borderWidth='base' borderRadius='base' padding='base'>
        <View>
          <View inlineAlignment='center'>
            <Text emphasis='bold'>{widgetData?.title?.features}</Text>
          </View>
          <View padding='extraTight' />
          <Grid columns={['fill', 'fill']} spacing='base'>
            {
              Array.from({ length: 2 }).map((_, j) => {
                return (
                  <GridItem key={featuresIds[j]} border='base' borderWidth='base' borderRadius='base' padding='base'>
                    <BlockStack>
                      <View blockAlignment='start'>
                        {/* <Icon source='truck' size='large' /> */}
                        <View maxInlineSize={40} maxBlockSize={40}>
                          <Image source={!j ? widgetData?.images?.firstCard : widgetData?.images?.secondCard} fit='cover' />
                        </View>
                        <View padding='tight' />
                        <Text emphasis='bold' size='large'>{!j ? widgetData?.firstCardTitle : widgetData?.secondCardTitle}</Text>
                        <View padding='extraTight' />
                        <TextBlock>{!j ? widgetData?.firstCardDescription : widgetData?.secondCardDescription}</TextBlock>
                      </View>
                    </BlockStack>
                  </GridItem>
                )
              })
            }
          </Grid>
        </View>
      </BlockLayout>
    </>
  )
}
