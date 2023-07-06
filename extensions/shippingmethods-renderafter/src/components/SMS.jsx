import { useExtensionApi, Text, BlockLayout, Checkbox } from '@shopify/checkout-ui-extensions-react';

export default function SMS({ data }) {
    const { extensionPoint } = useExtensionApi()
    const widgetData = JSON.parse(data?.widgets?.find(widget => widget.widget_position === extensionPoint)?.widget_customization)

    return (
        <BlockLayout border='base' padding='base' cornerRadius='base'>
            <Checkbox>
                Get SMS alerts about your orders
            </Checkbox>
            <Text appearance="subdued">{widgetData?.title?.sms || 'Stay up to date on your purchase with order confirmation and shipping confirmation messages.'}</Text>
        </BlockLayout>
    )
}
