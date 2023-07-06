import { useExtensionApi, Image, TextBlock, InlineLayout, BlockLayout } from '@shopify/checkout-ui-extensions-react';

export default function Payment({ data }) {
    const { extensionPoint } = useExtensionApi()
    const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

    let iconURLs = []
    try {
        iconURLs = JSON.parse(widgetData?.iconURLs)
    } catch { }

    return (
        <>
            <BlockLayout rows={['auto', 'fill']} border='base' borderWidth='base' borderRadius='base' padding='base' spacing='base'>
                {/* text */}
                <TextBlock inlineAlignment="center">{widgetData?.title?.payment || 'Guaranteed Safe & Secure Checkout'}</TextBlock>

                {/* image */}
                <InlineLayout inlineAlignment='center' spacing='base'>
                    {
                        iconURLs.map(icon => {
                            return <Image key={icon} source={icon} />
                        })
                    }
                </InlineLayout>
            </BlockLayout>
        </>
    )
}