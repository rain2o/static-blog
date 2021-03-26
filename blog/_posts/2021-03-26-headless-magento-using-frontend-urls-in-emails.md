---
title: Headless Magento - Using Frontend URLs in Emails
lang: en-US
date: 2020-12-16
published: true
description: Magento sends many transactional emails, but how can we tell it to use the Frontend URL when using Magento as headless?
tags:
 - magento
 - headless
 - ecommerce
 - php
published_devto: false
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cjtmsxl8n8pzcmtrmtac.jpg
---

## Quick Overview
Magento sends a lot of emails, and most of these emails have pertinent information like the list of products purchased or being shipped, order details, etc... Usually these emails provide a number of links to Magento so that the customer can view their account, order, a product, and so on.

But what can we do if we are using Magento as headless? It will send the customer the Magento URL instead of our frontend URL.

This is the solution I came up with. It might not be the _best_, but it's working for us.

If you would like to see the final code, I created [a sample module](https://github.com/rain2o/module-frontend) to go with this article.

---

## Create a new module
Following Magento's modular approach, let's create a new module to contain this functionality. Throughout this article I'll be using `Rain2o_Frontend` as the module name in the examples. Remember to replace these with your own module name when following along.

I won't cover how to create a module, this is covered in great detail by many articles as well as the [Magento documentation](https://devdocs.magento.com/videos/fundamentals/create-a-new-module/).

---

## Add some configurations
This step might not be necessary for your setup, but I like to keep environment details, like a URL for example, flexible instead of coded so it can be changed per environment easily. To do this, I added a new field in the Stores Configuration section to manage the Frontend URL.

### Creating the new field

Create a new file if you haven't already at `app/code/Rain2o/Frontend/etc/adminhtml/system.xml`. 

I decided to add a new group entirely for the Frontend URL field. This is because our setup actually contains multiple fields in this group, but that's just a unique need for our project. Having this separate group allows us to have a separate section that's easy to find and ready to grow as additional requirements are introduced.

This is what I have in `system.xml`:
```xml
<!-- app/code/Rain2o/Frontend/etc/adminhtml/system.xml -->
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Config:etc/system_file.xs">
    <system>
        <section id="web">
            <group id="frontend" translate="label comment" type="text" sortOrder="25" showInDefault="1" showInWebsite="1" showInStore="1">
                <label>Frontend URLs</label>
                <field id="base_url" translate="label comment" type="text" sortOrder="10" showInDefault="1" showInWebsite="1" showInStore="1">
                    <label>Frontend Base URL</label>
                    <comment><![CDATA[Specify full URL for frontend.]]></comment>
                </field>
            </group>
        </section>
    </system>
</config>
```

This is fairly straight-forward if you're familiar with Magento's system.xml file, but I'll break it down a little.

We are adding one new field called `base_url` inside a new group we created called `frontend`. This is all inside Magento's existing section `web`, which can be found in the admin at Stores -> Configuration -> General -> Web.

This field is set to be editable in all scopes - Global, Website, and Store. This is up to you and your needs. Just note that I handle multi-store functionality later, so there is no need to set this per store here. But you can do so if that fits your needs.

### Setting default value
Let's set a default value too, just so there's something to start with.

Create the file `app/code/Rain2o/Frontend/etc/config.xml`. Here I set the _production_ URL as the default. This can be changed in Magento per environment, but this guarantees production will start with the right value.

```xml
<!-- app/code/Rain2o/Frontend/etc/config.xml -->
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Store:etc/config.xsd">
    <default>
        <web>
            <frontend>
                <base_url>https://shop.example.com/</base_url>
            </frontend>
        </web>
    </default>
</config>

```

Now, install the module if you haven't already:
```bash
bin/magento setup:upgrade
```

Or, if the module is already installed, clean the cache:
```bash
bin/magento cache:clean
```

Once you do that, you should see this in the *Web* configuration section:
![The new Frontend URL field displayed in Magento's Configuration page, under the General Web section.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/u7emjhje619kqfdxxtad.png)

---

## How are URLs created in Emails?
Alright, now that the groundwork is done, let's figure out how to override the URLs generated in emails.

_Feel free to skip this part. I prefer to understand what I'm changing and why it is done in a certain way, so I wanted to help provide these details. If you just want to do the work, go to the next step._

After some digging, I discovered Magento's email templates use the model `\Magento\Email\Model\Template` for building the emails, which extends `\Magento\Email\Model\AbstractTemplate`.

In `AbstractTemplate` you will see the function `getUrl`, which is what is used in the email templates. This uses the _private_ property `$urlModel`, which is passed to the `__construct` as a dependency. The model that is used by default is `\Magento\Framework\Url`.

Digging around in `\Magento\Framework\Url`, we can see that there are two main functions that could be useful in generating the correct frontend URLs - `getRouteUrl` and `getBaseUrl`. Both of these functions are ultimately called from the `getUrl` function which is initially called in the template. `getBaseUrl` is where we can use the new field we just created for the base. But our frontend might not follow the same routing structure as Magento, so `getRouteUrl` is where we can handle those route changes.

But how do we do that without hacking core? Both of those functions are `public`, so we could use [Plugins](https://devdocs.magento.com/guides/v2.4/extension-dev-guide/plugins.html). But I chose instead to use dependency inject to inject a new URL model for email templates. This avoids having multiple plugins on a model which is probably used a lot throughout Magento, and instead gives us a single Model to handle all frontend URL logic. We can then use this model later as we discover new parts of Magento that might need this functionality.

---

## Overriding email URLs
Let's use [Magento's Dependency Inject file](https://devdocs.magento.com/guides/v2.4/extension-dev-guide/build/di-xml-file.html) to change the model which is passed to the email template for `urlModel`.

### Inject our own URL model

Create the file `app/code/Rain2o/Frontend/etc/di.xml`. Here we will tell Magento to use our own URL Model in the `__construct` of `\Magento\Email\Model\Template`.

```xml
<!-- app/code/Rain2o/Frontend/etc/di.xml -->
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:ObjectManager/etc/config.xsd">
    <type name="Magento\Email\Model\Template">
        <arguments>
            <argument name="urlModel" xsi:type="object" shared="false">Rain2o\Frontend\Model\Url</argument>
        </arguments>
    </type>
</config>
```

We told Magento that the `urlModel` argument for the class `\Magento\Email\Model\Template` should use our own model (we haven't created it yet) instead of the default model.

### Create our new URL Model
Now let's create the model we just referenced. This is where the good stuff will happen.

Create your model `app/code/Rain2o/Frontend/Model/Url.php`. If you look again at the Email Template model, you'll see that `urlModel` is passed as `\Magento\Framework\UrlInterface $urlModel`. Since we are changing the model for this, we need to be sure our model also implements that interface.

First let's create the class skeleton, then we'll add in the pieces.

*NOTE* - I am leaving out DocBlocks and comments to keep the sample code slim. Don't forget to document your code thoroughly!

```php
<?php /** app/code/Rain2o/Frontend/Model/Url */
declare(strict_types=1);

namespace Rain2o\Frontend\Model;

use Magento\Framework\UrlInterface;

class Url extends \Magento\Framework\Url implements UrlInterface
{
    // ...
}
```

As you can see I extended the model we are replacing - `Magento\Framework\Url`. This will allow us to use existing functionality without rewriting it, and only replace the pieces we need to modify.

### Get Frontend URL from config
The first thing we know we're going to need to do is get the value of the new field we added in `system.xml`. Fortunately, the model we are extending already has a `protected` function `_getConfig` to get config values.

At the top of the class, let's add a constant to contain the path to our new field:
```php
const FE_URL_PATH = "web/frontend/base_url";
```

We also want to make sure that our frontend URL logic is only executed if the current scope is for frontend. So let's go ahead and add a flag to indicate if we're in admin scope or not. We'll use this later.
```php
/**
 * @var bool
 */
private $isAdmin = false;
```

The base model is rather large, and this next part can be daunting. So let's start from the bottom and work our way up. The first thing we need to modify is the base url. So let's copy the `public function getBaseUrl($params = []) {}` function to our new model from the original in `Magento\Framework\Url`. We will add a few pieces into the existing code. Here's the final version of the function, we'll break it down next.

```php
public function getBaseUrl($params = [])
{
    /**
     *  Original Scope
     */
    $this->origScope = $this->_getScope();

    if (isset($params['_scope'])) {
        $this->setScope($params['_scope']);
    }

    // CUSTOM CODE
    // we only want to override if we're in frontend
    if ($this->_getScope()->getCode() === 'admin') {
        $this->isAdmin = true;
        return parent::getBaseUrl($params);
    } else {
        $this->isAdmin = false;
    }
    // END CUSTOM CODE

    if (isset($params['_type'])) {
        $this->getRouteParamsResolver()->setType($params['_type']);
    }

    if (isset($params['_secure'])) {
        $this->getRouteParamsResolver()->setSecure($params['_secure']);
    }

    /**
     * Add availability support urls without scope code
     */
    if ($this->_getType() == UrlInterface::URL_TYPE_LINK
        && $this->_getRequest()->isDirectAccessFrontendName(
            $this->_getRouteFrontName()
        )
    ) {
        $this->getRouteParamsResolver()->setType(UrlInterface::URL_TYPE_DIRECT_LINK);
    }

    // CUSTOM CODE
    // remove slash so we can add one and know it's only one
    $result = rtrim($this->_getConfig(self::FE_URL_PATH), "/") . "/";
    // add store code
    $result .= $this->_getScope()->getCode() . "/";
    // END CUSTOM CODE

    // setting back the original scope
    $this->setScope($this->origScope);
    $this->getRouteParamsResolver()->setType(self::DEFAULT_URL_TYPE);

    return $result;
}
```

I surrounded any additions or changes in comments to make it easier to see what we modified.

The first thing we did was check the current scope. If it's admin we set our `$this->isAdmin` flag to true (we will check this in other functions later), and then return the execution of the parent function. This way we don't modify the behavior for admin URLs, and we stop any further execution of our custom logic.

The second change was how we create `$result`. Instead of using Magento's built in function (previously it was `$this->_getScope()->getBaseUrl(...)`, we want to use our new value.

So we modified it to be
```php
$result = rtrim($this->_getConfig(self::FE_URL_PATH), "/") . "/";
```
The `rtrim` is just an extra precaution to ensure there is always one, and only one slash at the end. Since this is a field in Magento configuration, we can't always control that, so we force it this way.

The next line we add the store code to the URL. Of course this is optional according to your setup. We actually use locales in our frontend URLs, so I have additional logic to convert the store code to the appropriate local, but that's not necessary for this article.

```php
$result .= $this->_getScope()->getCode() . "/";
```

You can modify this to fit your store's needs.

And that's it for that function. We now should be retrieving the frontend base URL with store code.

### Handling routes
The other function I mentioned earlier is `getRouteUrl`. This is where we need to handle our route patterns for the frontend. The parent model we are extending uses Magento code for generating routes which we want to bypass. The actual logic for that is in a couple of `protected` functions we'll look at next. The code for this function is pretty slim.

```php
public function getRouteUrl($routePath = null, $routeParams = null)
{
    // get our new base URL for frontend
    $base = $this->getBaseUrl($routeParams);

    // use parent if we're in admin scope
    if ($this->isAdmin) {
        return parent::getRouteUrl($routePath, $routeParams);
    }

    // route mapping happens here
    $this->_setRoutePath($routePath);

    // use our base url and the mapped route path
    $frontUrl = $base . $this->_getRoutePath($routeParams);

    return $frontUrl;
}
```

First we get the new base url we just created. Next we check if we're in admin scope, and if so then just execute the parent function again. Otherwise we call `$this->_setRoutePath()`, which is where the actual mapping of routes happens.

And finally we combine all of the above work to create our full frontend URL with route.

### Mapping the routes
Now we need to handle the mapping of routes. First we'll create our own `_setRoutePath` function to handle this. If you look at the parent class, this function uses a lot of Magento code like `$this->_getRequest()->getControllerName();` and similar. We don't want any of this for our frontend. This function actually gets a bit smaller, depending on your mapping needs.

For our setup, we actually have pretty straightforward routes, so we don't have any mapping logic. Instead we just use the route path as-is, because that matches our frontend routes.

```php
protected function _setRoutePath($data)
{
    // kept from original
    if ($this->_getData('route_path') == $data) {
        return $this;
    }

    $this->unsetData('route_path');
    $routePieces = explode('/', $data);
    
    // additional logic here if needed to map route path to frontend routes
    $pieces = $this->yourFunctionForMappingRoutes($routePieces);

    $this->setData('route_path', implode("/", $pieces));
    return $this;
}
```

Most of the code we have is kept from the original function, but we removed a lot of unused code. I placed a comment where you could implement custom logic for mapping routes according to your needs. This will be different for everyone.

We set the data after handling the mapping, and we're done.

### Getting the mapped routes
We also need to remove some logic from the `_getRoutePath` function, because it uses some additional Magento logic for rewrites that we don't need.

```php
protected function _getRoutePath($routeParams = [])
{
    // use parent function if we're in admin scope
    if ($this->isAdmin) {
        return parent::_getRoutePath($routeParams);
    }
    return $this->_getData('route_path');
}
```

We first check if we're in admin, and if so execute the parent function again. After that we only return the previously set `route_path` data.

And that does it. Now if you clean the cache - `bin/magento cache:clean`, you should be able to test your emails and find the new frontend URLs.

### Final Look
Here is the final version of our URL model
```php
<?php
declare(strict_types=1);
namespace Rain2o\Frontend\Model;

use Magento\Framework\UrlInterface;

class Url extends \Magento\Framework\Url implements UrlInterface
{
    const FE_URL_PATH = "web/frontend/base_url";

    /**
     * @var bool
     */
    private $isAdmin = false;

    public function getBaseUrl($params = [])
    {
        /**
         *  Original Scope
         */
        $this->origScope = $this->_getScope();

        if (isset($params['_scope'])) {
            $this->setScope($params['_scope']);
        }

        // CUSTOM CODE
        // we only want to override if we're in frontend
        if ($this->_getScope()->getCode() === 'admin') {
            $this->isAdmin = true;
            return parent::getBaseUrl($params);
        } else {
            $this->isAdmin = false;
        }
        // END CUSTOM CODE

        if (isset($params['_type'])) {
            $this->getRouteParamsResolver()->setType($params['_type']);
        }

        if (isset($params['_secure'])) {
            $this->getRouteParamsResolver()->setSecure($params['_secure']);
        }

        /**
         * Add availability support urls without scope code
         */
        if ($this->_getType() == UrlInterface::URL_TYPE_LINK
            && $this->_getRequest()->isDirectAccessFrontendName(
                $this->_getRouteFrontName()
            )
        ) {
            $this->getRouteParamsResolver()->setType(UrlInterface::URL_TYPE_DIRECT_LINK);
        }

        // CUSTOM CODE
        // remove slash so we can add one and know it's only one
        $result = rtrim($this->_getConfig(self::FE_URL_PATH), "/") . "/";
        // add store code
        $result .= $this->_getScope()->getCode() . "/";
        // END CUSTOM CODE

        // setting back the original scope
        $this->setScope($this->origScope);
        $this->getRouteParamsResolver()->setType(self::DEFAULT_URL_TYPE);

        return $result;
    }

    public function getRouteUrl($routePath = null, $routeParams = null)
    {
        // get our new base URL for frontend
        $base = $this->getBaseUrl($routeParams);

        // use parent if we're in admin scope
        if ($this->isAdmin) {
            return parent::getRouteUrl($routePath, $routeParams);
        }

        // route mapping happens here
        $this->_setRoutePath($routePath);

        // use our base url and the mapped route path
        $frontUrl = $base . $this->_getRoutePath($routeParams);

        return $frontUrl;
    }

    protected function _setRoutePath($data)
    {
        // kept from original
        if ($this->_getData('route_path') == $data) {
            return $this;
        }

        $this->unsetData('route_path');
        $routePieces = explode('/', $data);
        
        // additional logic here if needed to map route path to frontend routes
        $pieces = $this->yourFunctionForMappingRoutes($routePieces);

        $this->setData('route_path', implode("/", $pieces));
        return $this;
    }

    protected function _getRoutePath($routeParams = [])
    {
        // use parent function if we're in admin scope
        if ($this->isAdmin) {
            return parent::_getRoutePath($routeParams);
        }
        return $this->_getData('route_path');
    }
}
```

---

## Closing remarks
There will be plenty of edge-cases and unique needs in something like this, so your implementation will probably vary and grow over time. This is a simplified version of what we have implemented, as some of our needs were unique and not valuable to this tutorial.

I am hoping one day Magento implements a built-in solution for these types of issues, especially with the PWA Studio being a thing now. Until then, we will continue to help each other find our own solutions.

Do you have a better solution? Did this work for you? Let me know, I'd love to check out better solutions if possible!
