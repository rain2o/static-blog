---
title: Using field dependency in Magento 2
lang: en-US
date: 2020-12-16
published: true
description: Learn how to make field visibility depend on the value of other fields in Magento 2, using built-in features already provided by Magento. No custom JavaScript necessary!
tags:
 - magento2
 - magento
 - xml
 - php
meta:
  - name: description
    content: Learn how to make field visibility depend on the value of other fields in Magento 2, using built-in features already provided by Magento. No custom JavaScript necessary!
  - property: og:title
    content: Using field dependency in Magento 2
published_devto: true
---

[Skip the details, show me the code](#what-to-do)

## Quick Summary
One of the most common questions I see and have asked myself for Magento 2 is how to create fields that are dynamically visible, dependent on the value of another field. This article will walk through how to do this using the tools already provided by Magento.

I have seen a lot of solutions out there, most of which involve building this feature yourself with some custom Javascript, which is just fine however I prefer to use the tools already provided by the system when available. This article is an extension of my answer on the Magento Stack Exchange here - {% stackexchange 256280 magento %}

## Behind the Curtain
The steps in this article walk through how to implement this functionality. But to give you a high-level view at what functionality we will be taking advantage of, and where you can find it used in the wild (i.e. core Magento), here's some quick info.
All form element ui components that extend `Magento_Ui/js/form/element/abstract.js` have a `switcherConfig` setting available for purposes such as hiding/showing elements as well as other actions. The switcher component can be found at [Magento_Ui/js/form/switcher](https://github.com/magento/magento2/blob/2.1/app/code/Magento/Ui/view/base/web/js/form/switcher.js) for the curious. You can find examples of it being used in [sales_rule_form.xml](https://github.com/magento/magento2/blob/2.1/app/code/Magento/SalesRule/view/adminhtml/ui_component/sales_rule_form.xml#L158) and [catalog_rule_form.xml](https://github.com/magento/magento2/blob/2.1/app/code/Magento/CatalogRule/view/adminhtml/ui_component/catalog_rule_form.xml#L213). Of course if you are using your own custom component already you can still use this as long as your component eventually extends `abstract`.

## Requirements
This article was written using Magento 2.3, however this feature has been available as of Magento 2.1.0.
This article assumes you have a custom module you are implementing this functionality into. If you need help building a module, check out the [Magento dev docs](https://devdocs.magento.com/videos/fundamentals/create-a-new-module/).

## Set the Stage
To make things easier, let's define some requirements for a feature we're going to build. I am going to use an example of something I built recently so that I can give real examples.

Let's say you have created a new entity in Magento called a Shipping Carrier, and you have created a view in admin to edit these Shipping Carriers. To use the feature we are discussing in this article, you should be using Magento's [UI Components](https://devdocs.magento.com/guides/v2.4/ui_comp_guide/bk-ui_comps.html). More on that later.

While editing a Shipping Carrier, we want the ability to enable Tracking for some carriers, and if Tracking is enabled we want to provide a Tracking URL. We will create two fields for this:

1. Tracking Enabled (`tracking_enabled`)
2. Tracking URL (`tracking_url`)

To make things cleaner for the content editors, we will hide the Tracking URL field unless Tracking Enabled is set to Enabled (yes this is redundant, but naming is the hardest part of being a developer, right?). Below is a screen recording of the end result we will be trying to accomplish.

![Editing a Shipping Carrier in Magento 2. There is a field titled "Tracking Enabled" which is set to the value "Disabled" currently. When changing this value to Enabled, a new field is displayed titled "Tracking URL".](https://dev-to-uploads.s3.amazonaws.com/i/bg8l4bmcx0bxa13nyejz.gif)

For the purposes of this article, I will skip the creation of a module and the creation of the Shipping Carrier controller and UI Component form, as this is focused on toggling visibility of fields in a UI Component form. You can find a number of articles showing [how to create UI Component forms](https://www.mageplaza.com/devdocs/creat-a-ui-form-in-magento-2.html) in Magento 2.

## What to do
Finally, let's get started on the code. Once you have created your module and the appropriate controller and layout, you should have a file in your module like `{Namespace}/{ModuleName}/view/adminhtml/ui_component/shipping_carrier_form.xml`. This file will change depending on what type of entity you are working on, and the name of the UI Component form you created. For the Product Edit form for example, it would be `product_form.xml`.

First, let's add our two new fields to the `shipping_carrier_form` UI Component form. The relevant part of the file will look something like this.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<form xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Ui:etc/ui_configuration.xsd">
  ...
  <fieldset name="carrier_information" sortOrder="10">
    ...
    <field name="tracking_enabled" formElement="select">
      <argument name="data" xsi:type="array">
        ...
      </argument>
      <settings>
        <validation>
          <rule name="required-entry" xsi:type="boolean">true</rule>
        </validation>
        <dataType>number</dataType>
        <label translate="true">Tracking Enabled</label>
        <scopeLabel>[WEBSITE]</scopeLabel>
        <visible>true</visible>
        <dataScope>tracking_enabled</dataScope>
      </settings>
      <formElements>
        <select>
          <settings>
            <options>
              <option name="0" xsi:type="array">
                <item name="value" xsi:type="number">1</item>
                <item name="label" xsi:type="string" translate="true">Enabled</item>
              </option>
              <option name="1" xsi:type="array">
                <item name="value" xsi:type="number">0</item>
                <item name="label" xsi:type="string" translate="true">Disabled</item>
              </option>
            </options>
          </settings>
        </select>
      </formElements>
    </field>
    <field name="tracking_url" formElement="input">
      <argument name="data" xsi:type="array">
        ...
      </argument>
      <settings>
        <validation>
          <rule name="required-entry" xsi:type="boolean">true</rule>
        </validation>
        <dataType>text</dataType>
        <label translate="true">Tracking URL</label>
        <scopeLabel>[WEBSITE]</scopeLabel>
        <visible>true</visible>
        <dataScope>tracking_url</dataScope>
      </settings>
    </field>
  </fieldset>
</form>

```

So now we have the two fields always visible and always required for Shipping Carriers. To see the changes you may need to clear cache if you have it enabled.

Now, let's get to the problem at hand. We want to hide the Tracking URL field unless Tracking is Enabled. At this point, we need to add a bit of XML into the controller field. By controller field, I mean the field that controls the visibility of the other field(s). In our case, this will be the field `tracking_enabled`. We need to add `<switcherConfig>` inside the `<settings>` node of this field. It should look something like this.
```xml
<switcherConfig>
  <rules>
    <rule name="0">
      <value>0</value>
      <actions>
        <action name="0">
          <target>shipping_carrier_form.shipping_carrier_form.carrier_information.tracking_url</target>
          <callback>hide</callback>
        </action>
      </actions>
    </rule>
    <rule name="1">
      <value>1</value>
      <actions>
        <action name="0">
          <target>shipping_carrier_form.shipping_carrier_form.carrier_information.tracking_url</target>
          <callback>show</callback>
        </action>
      </actions>
    </rule>
  </rules>
  <enabled>true</enabled>
</switcherConfig>
```

Now the Tracking URL field will be hidden unless the Tracking Enabled field is set to Enabled. It will also only be required if it is visible. But let's break down what we just added so we can understand what it does.

The `<switcherConfig>` component contains an array of rules which is what we're building out here. Each `<rule>` has a name which is a number in this example. This name is the array index for this item. As these are arrays, they should start with 0, not strings or 1.

Inside each `<rule>` we pass two arguments.

1. `<value>` - This is the value of `tracking_enabled` which should trigger the actions defined below.
2. `<actions>` - Here we have another array. These are the actions to be triggered when this rule's conditions are met. Again, each `action`'s name is just the array index of that item.

Now each `<action>` has two arguments as well (with an optional 3rd).

1. `<target>` - This is the element you wish to manipulate under this action. If you aren't familiar with how `ui_component` element names are composed in Magento you can check out [Alan Storm's article](https://alanstorm.com/magento_2_introducing_ui_components/). It's basically something like `{component_name}.{component_name}.{fieldset_name}.{field_name}` in this example.
2. `<callback>` - Here is the action to be taken on the above mentioned target. This callback should be a JavaScript function that is available on the element targeted. Our example uses `hide` and `show`. This is where you can start to expand on the functionality available. The `catalog_rule_form.xml` example I mentioned earlier uses `setValidation` if you wish to see a different example.
3. You can also add `<params>` to any `<action>` that calls for them. You can see this in the `catalog_rule_form.xml` example as well.

Finally the last item inside `<switcherConfig>` is `<enabled>true</enabled>`. This should be pretty straight forward, it's a Boolean to enable/disable the switcher functionality we just implemented.

And we're done! The final XML for our new fields should look like this.

```xml
<field name="tracking_enabled" formElement="select">
  <argument name="data" xsi:type="array">
    ...
  </argument>
  <settings>
    <validation>
      <rule name="required-entry" xsi:type="boolean">true</rule>
    </validation>
    <dataType>number</dataType>
    <label translate="true">Tracking Enabled</label>
    <scopeLabel>[WEBSITE]</scopeLabel>
    <visible>true</visible>
    <dataScope>tracking_enabled</dataScope>
    <switcherConfig>
      <rules>
        <rule name="0">
          <value>0</value>
          <actions>
            <action name="0">
              <target>shipping_carrier_form.shipping_carrier_form.carrier_information.tracking_url</target>
              <callback>hide</callback>
            </action>
          </actions>
        </rule>
        <rule name="1">
          <value>1</value>
          <actions>
            <action name="0">
              <target>shipping_carrier_form.shipping_carrier_form.carrier_information.tracking_url</target>
              <callback>show</callback>
            </action>
          </actions>
        </rule>
      </rules>
      <enabled>true</enabled>
    </switcherConfig>
  </settings>
  <formElements>
    <select>
      <settings>
        <options>
          <option name="0" xsi:type="array">
            <item name="value" xsi:type="number">1</item>
            <item name="label" xsi:type="string" translate="true">Enabled</item>
          </option>
          <option name="1" xsi:type="array">
            <item name="value" xsi:type="number">0</item>
            <item name="label" xsi:type="string" translate="true">Disabled</item>
          </option>
        </options>
      </settings>
    </select>
  </formElements>
</field>
<field name="tracking_url" formElement="input">
  <argument name="data" xsi:type="array">
    ...
  </argument>
  <settings>
    <validation>
      <rule name="required-entry" xsi:type="boolean">true</rule>
    </validation>
    <dataType>text</dataType>
    <label translate="true">Tracking URL</label>
    <scopeLabel>[WEBSITE]</scopeLabel>
    <visible>true</visible>
    <dataScope>tracking_url</dataScope>
  </settings>
</field>
```

Good luck with your dynamic fields! Feel free to post comments if this article helped you build something, or if you have any questions or other feedback.2