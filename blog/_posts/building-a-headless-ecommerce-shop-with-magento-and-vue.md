---
title: Building a headless eCommerce shop with Magento and Vue
lang: en-US
date: 2022-01-28
published: true
description: Despite the performance concerns with Magento 2, we managed to build a fast eCommerce shop with Vue Storefront.
tags:
  - magento
  - vue
  - javascript
  - ecommerce
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gswwb3o849caxgio7pcj.jpg
published_devto: true
---

## How it started

Having worked in Magento for years, I am all too familiar with the challenges that come with using it, especially when it comes to performance. However, I do enjoy the extensibility of Magento, and the massive community that comes with it.

For years, [Netatmo's](https://netatmo.com) online [shop](https://shop.netatmo.com) was running on Magento 1, and it "worked" sufficiently for the time. Between the years of technical debt as a result of numerous developers and agencies working on it, and the upcoming EOL for Magento 1 support, it was quickly becoming obvious that an upgrade was due for the shop.

## Deciding on the stack

One of the most challenging parts of any project - what technology stack do we want to use!?

We decided to stick with Magento, moving to v2, for a number of reasons. The migration from M1 to M2 should be easier than from Magento to some other platform. I have worked with Magento 1 and 2 for a number of years, and migrated multiple sites from M1 > M2. Being the technical lead of the shop, it made sense for us to use Magento 2 as it would mean less learning time on my part, and an easier onboarding process for other devs. And finally, we couldn't find another eCommerce solution that provided the extensibility of Magento, and allowed us to host it internally due to our very serious approach to security.

Ok, Magento 2 it is. But, what about the frontend? Magento is notoriously slow, and seems to be getting worse in v2. So what about separating the frontend? There are plenty of choices with all of the powerful JavaScript frameworks and libraries available today.

Magento PWA Studio was in development at the time, and not ready to use in production. Additionally, it is built in React, and the preferred technology for most of our frontend team is Vue. So, we shopped around.

_Enter [Vue Storefront](https://www.vuestorefront.io/)._

With Vue Storefront (VSF), we could build a completely separate frontend as a PWA, using tech like ElasticSearch, Redis, and localStorage to provide a significant boost in performance. This meant a number of important things.

**Limiting communication with Magento**

Because most of our data would be stored in ElasticSearch, we could limit API calls to Magento to only necessary moments - when we need live data (checking current stock on checkout) or when an action needs to be stored or calculated by Magento (i.e. placing an order). This means even if Magento is slower than we'd like, it only impacts the user's experience at specific points, which we can control. Of course we still took necessary measures to optimize Magento's performance as best as we could for those moments.

**Locking down Magento**

The client never talks directly to Magento, but instead goes through the Vue Storefront API. This means, we can completely lock down our Magento instance from the outside world, only allowing communication to and from specific sources which we meticulously control. Of course we still need to follow security best-practices and keep everything up-to-date, but this low-level restriction provides an additional level of protection from inevitable vulnerabilities in a PHP-based framework like Magento.

**Frontend freedom**

We would no longer be locked-in to the Magento frontend. This is great because we can share the frontend development across our team without the need to teach others an entirely new templating framework. If you've worked in a Magento theme, you know this is huge - it's not exactly a simple theming system. This meant our Vue developers come be onboarded fairly painlessly, and we could focus on what's important - building it.

**Improving deployments**

Separation of concerns means easier iteration, and less downtime. With Magento being used as headless, our frontend and backend can have separate projects with their own repos, pipelines, etc... This means we can deploy back-end and frontend changes independently without impacting the full stack.

Also, since the frontend is a PWA, when we do deploy to Magento the frontend won't be completely down. Magento has to run a lot of things during deployment, and only some of it can be handled in the pipeline before taking it down for Maintenance. With VSF, we can allow the frontend to run almost as usual - except for those moments we need to communicate with Magento, which can either be queued or handled as if the user is offline. And because deploying a Vue app is much faster than a full Magento deployment, we can iterate the frontend quickly with virtually no downtime for the users, all without impacting the Magento administration teams.

Alright, so it's decided. Vue Storefront + Magento 2 will be our stack.

## Technical overview

I'm not going to give away too much for the sake of security, but here are some details about how Vue Storefront works in general and how we implemented it specifically.

Let's work our way from back to front.

### Magento

This layer doesn't need too much detail. It's a pretty standard Magento 2 setup for the most part. The key difference is that our Magento instance is not publicly accessibly. Here are a few benefits and hurdles that this introduced.

**Better access control**

We have two ways to access Magento - the API is access at a specific domain, while the back-office is accessed from a different domain. This allows us to maintain a separate list of allowed sources for the API integrations vs administrators. This is on top of the access-control list (ACL) management provided by Magento. Now we've got three layers of managed permissions to get through - Firewall, web server allowances managed per route, and Magento ACL (for both administrators and API users).

**Backend integrations are challenging**

Due to these restrictions, we have some potential hurdles to overcome with any new integration we introduce into Magento.

The 3rd party's system must provide a list of static IPs, or a way for us to generate a list from their IP pool. Not all systems can provide this which has become a blocking point on a few features. At this point we must either find a new vendor, request the vendor provide us an alternative, or compromise on some workaround between the two of us. It can be frustrating and time-consuming, but in the end I still believe it's worth it.

**Magento URLs are always wrong**

Magento comes with some built-in code for generating URLs for products, categories, pages, etc... However, these are inherently wrong for us now because it uses the Magento URL, and not our frontend. This can be a concern with [emails sent from Magento](https://dev.to/rain2o/headless-magento-using-frontend-urls-in-emails-5gd) for example, or with any 3rd party module that might export data. This isn't a concern on the frontend as Vue Storefront handles this, but when it comes to Magento-only functionality / integrations, this can be an issue.

For now, the only solution I have been able to come up with is using well-placed plugins to generate frontend URLs when a frontend URL is trying to be generated by Magento. To do this I added some configuration fields in Magento to provide things like the frontend base URL, and some path details. We also pull some final data from ElasticSearch (more on that later) to use the same indexed data as VSF.

I have hopes that Magento might introduce a similar type of feature one day, especially with the new PWA Studio they provide and the increasing popularity of the headless approach.

### ElasticSearch

The team at Vue Storefront provides a [Magento 2 module](https://github.com/vuestorefront/magento2-vsbridge-indexer) which uses Magento's native indexing functionality to index all pertinent data to ElasticSearch (ES) in a format which can be utilized by VSF. Because it hooks into the native indexing of M2, data can be automatically reindexed on Save if you wish to configure it to do so.

Now, I know Magento 2 also comes with ES, and they can use the same instance I believe, but VSF requires the data to be sent in a uniform way it can read. They have a "platform agnostic" approach, so the data on the front needs to be as _pure_ as possible, removing back-end platform flavor where possible. The module seems well-built, and even has a CLI command for reindexing manually with a few options. We have also created a few of our own modules which extend the VsBridge module to index some custom data points to ES.

Thanks to this module, the static data now sits in ES, allowing our frontend to quickly fetch minimal data as needed without putting load on Magento.

### Vue Storefront API

Vue Storefront comes with [its own API](https://github.com/vuestorefront/vue-storefront-api) which serves as a sort of middleware. It is written in NodeJS, which is nice because it means another technology isn't introduced into our stack. JavaScript developers can work on this layer as needed and feel right at home.

This API layer is what the frontend uses for all of its requests. The API handles the decision of where and how to send or retrieve data. It also handles the platform-specific communication - this is the pivot point for the platform agnostic approach. It can decide if it should check Redis (cache) for data being requested, or look in ElasticSearch, request directly from Magento 2 (or whatever your backend platform might be), or any other 3rd party integration you might decide to introduce.

Because it is built in Node, this means you can handle API integrations without exposing keys and such to the client side. It also lets the frontend not worry about system logic, and focus on being a great frontend.

_Note_ - The VSF team is working on a [new Storefront API](https://github.com/vuestorefront/storefront-api) which is being built in a more modular and agnostic way. I believe their intention is for it to be able to be used with any stack, not tied to VSF on the front. I haven't used it yet as it's still not production-ready last time I checked, but I'm excited to try it out.

### Vue Storefront

Finally, the part everyone sees - the blazing fast Vue frontend!

Vue Storefront uses Vuex under the hood for state management, and has separated the stores in a modular fashion - similar to Magento's modular approach of extensions in v2. It also has example modules for a great starting point in building your own modules. You can easily include/exclude any modules you wish, because not all shops are alike.

For example, I recently built our own Newsletter module and excluded the built-in Newsletter module. This was because we had so many differences in how we wanted to handle it that it just made more sense than trying to extend the core module to work for us.

The framework is extensible as well, and getting better every day. In addition to standard Vue features like `subscribe` and `subscribeAction`, VSF has introduced `hooks` in key places throughout the core. You can fairly painlessly subscribe to a particular hook to either trigger a reaction to a specific event, or in some cases mutate the data being used after the hook. Bus Events are also used throughout core as another way to easily hook into events to trigger your own behavior at key points.

There is a basic theme which comes with Vue Storefront, though in recent versions they have been pushing to use [Capybara](https://capybara.storefrontcloud.io/) as a starting point, or reference point, for your theme building. Of course this is up to you, but it's nice to have a reference when building a theme in a framework like this.

_Note_ - If you look at Vue Storefront, you will see **v1** and **V2**. At the time of building our shop VSF 2 was not ready for Magento. It is a new build of Vue Storefront, but they are focusing on other back-end integrations as the v1 has a solid integration with M2. Just something worth noting. VSF 2 is built on Nuxt, which is exciting as well!

## Final words

If you made it this far, thank you for sticking with me! Just a few closing thoughts.

Looking at the architecture, it does seem quite complex compared to a standard Magento setup, but in the end it is totally worth it. Plus, with the separation of technologies, you can separate responsibilities more easily, and it becomes less overwhelming.

One thing that I really enjoy about this setup is that everything is Open Source. Magento has always been open source, and has a massive community. Vue Storefront is open source, along with all of its tools. Their community is rapidly growing, and very active. During our project I was able to contribute to various VSF projects multiple times, as well as participate in community conversations on their Slack/Discord. I truly enjoy working in technologies with this sort of environment, plus it's a nice feeling to know you contributed to a core piece of technology you use day-to-day.

## Questions/Comments?

There is so much I didn't get to talk about in this already too long post. If there is something you would like to hear more about, leave a comment and let me know! If it's something I can disclose I'd be happy to write another post about more specific pieces.

Let me know what technology you used for your eCommerce site, I'd love to see what I'm missing out on!
