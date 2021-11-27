---
title: I built my first SaaS on Next.js
lang: en-US
date: 2021-08-17
published: true
description: My experience building my first SaaS using the React framework Next.js
tags:
  - react
  - nextjs
  - saas
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qqstgwmgqwqk3gvtz2z0.jpg
published_devto: false
published_devto: true
---

## Background
I have been a software engineer in some form or fashion for around 10 years, working in anything from Python, PHP, Swift, C# to vanilla JS, jQuery, Vue, and React. Over the past few years I have been getting to know the modern JS framework better, playing around with the different frameworks. I spend most of my days working in Vue, and I have created some side-projects in React to have a better understanding of them both. 

I'm not a fan of these tech wars, and to me these JS frameworks are ultimately the same thing. I have enjoyed working in Vue a bit more, but it's just due to personal preference.

## The Idea
A few years ago I had to take a car to the mechanic. After a week of not hearing anything I called them. Apparently they needed to replace the engine (it was a known issue with this make/model). This wait... call... wait... call... cycle happened for weeks until the job was complete. I hated it.

So, I had the idea that it could be useful for service-providers to have an easy-to-use platform to provide these status updates to their customers which could notify the customer via email, sms, or push notifications. It could provide a timeline view of the job with the history of updates, etc... And if possible, would be great to integrate into existing tools as to not create too much additional work on their part. But it could same them from repeated customer calls asking the same question - "What's the status of my ____?"

But I didn't do anything about it. Long story short, it took me around 4 years to finally get around to building the thing.

Enter [Status Tracker](https://statustracker.app). At the time of writing this it is still in private Early Access. There is a sign-up form on the landing page for those interested in getting early access.

## Why Next.js
As I mentioned in my background, I usually prefer Vue, I just enjoy it more, but I'm open to using other technologies for the right reasons. I was planning to build it in Nuxt.js because I haven't used it much but I've heard great things.

And then [Max Stoiber](https://twitter.com/mxstbr) released [Bedrock](https://bedrock.mxstbr.com/). It really had everything already setup out of the box:

* [TypeScript](https://www.typescriptlang.org/)
* [GraphQL](https://graphql.org/)
* [GraphQL Codegen](https://www.graphql-code-generator.com/) and [Nexus](https://nexusjs.org/) meant full-stack typing from DB models to client queries and components.
* [Passport](https://www.passportjs.org/) - User auth already setup and ready to go
* [Stripe](https://stripe.com/) - Basic Stripe integration for subscription plans configured and working.
* Things like [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) already configured to lint and auto-fix issues while coding and at pre-commit.
* [Postmark](https://postmarkapp.com/) for transactional emails
* A few other things...

Overall, it was exactly what I needed for my first time building a SaaS - a boilerplate with the essentials already working. It was ready for me to start adding my custom features to it as soon as I got it. Not to mention Max created a Discord server for those who have purchased a license of Bedrock so that we can support each other and share our projects.

I pre-ordered it before it was released and got it at a great deal. But even at full price it's more than worth it.

So, this setup was definitely worth the switch from Vue to React. It gave me a chance to learn even more about React as well.

## Let's get technical
I'll try not to go too deep into details here, but if you are curious to find out more about anything in particular let me know and I can write up a smaller post about it! I'm also not going to drone on about all of the models and views that I created. I just want to cover some of the more fun, interesting, or difficult things I worked on.

Here's what we'll go over:
* [Hosting](#hosting)
* [Frontend component library](#frontend)
* [Email notifications](#email)
* [SMS notifications](#sms)
* [URL Shortener](#shortener)
* [Scheduled jobs](#crons)
* [Customer portal with custom branding](#customer)

### <a name="hosting"></a> Hosting
I decided to try Vercel for hosting this project. I have used Netlify in the past, but since Vercel was built by the same people who built Next.js, and it was originally created for Next.js, I thought it would be a great fit. It was simple to setup and works pretty well. A few caveats I had to work around with my specific setup, but they typically had documentation around this.

For hosting the database (which is Postgres) I went with [supabase](https://supabase.io/). I was already using [Prisma](https://www.prisma.io/) for the ORM since it came with Bedrock, so I didn't use the SDJ from Supabase. However, it was simple to setup a new account, grab the connection string, and hook it into my existing code. They have a good free tier for a project like this. And I enjoy their UI when using the web app.

### <a name="frontend"></a> Frontend component library
I decided to go with [Material-UI](https://material-ui.com/) for a number of reasons.
For starters, I'm not very strong in design, so I wanted an opinionated frontend framework that would guide me to better design. Something that didn't require very much customization to make it look decent. I have heard great things about Material-UI, and it works great with Next.js. They also provide some nice demos to help inspire my non-creative brain.

I decided on a basic color palette and created a custom theme using their theme config. After that it was mostly import and use, with a few adjustments for spacing and such. It's not beautiful, but my goal was to make it easy to use and understand. I'll worrying about a makeover later.

### <a name="email"></a> Email notifications
For sending transactional emails I stuck with Postmark JS as the boilerplate came with it baked in. I could have switched it out fairly easily, but decided to stick with what was ready for me.

I setup some templates in Postmark using their pre-made templates as a starting point. I could define variables in their template (like a user's name or a company/project name). Then using their SDK it was pretty simple to send emails with the intended template and variables. Here's an abbreviated example.

```typescript
import { Client } from "postmark";
const client = new Client(API_TOKEN);

client.sendEmailWithTemplate({
  From: FROM_EMAIL,
  To: input.to,
  TemplateAlias: input.template,
  TemplateModel: {
    name: input.name,
    company_name: input.company,
    action_url: input.url,
  },
});
```

Postmark was pretty easy to setup and use, and their default templates are better than what I would have created. So far I am pretty happy with them.

### <a name="sms"></a> SMS notifications
Originally I did not plan to have SMS notifications. However, I had some conversations with potential customers, and it was brought to my attention that the intended users might be on their phones in the field. For example, a construction crew on the project site. I decided to go ahead and add this, even though it sort of stretched the MVP concept.

For the frontend component, I decided to use [Material-UI Phone Number](https://github.com/alexplumb/material-ui-phone-number), which is a fork of `react-phone-input-2` made for Material-UI. I didn't want to spend time building my own phone number input, but having the auto-format and country select was a nice feature.

I also decided to use [google-libphonenumber](https://www.npmjs.com/package/google-libphonenumber) on the server-side to handle formatting and validation of the phone input.

To send the SMS notifications I went with [Amazon SNS](https://aws.amazon.com/sns/). I was hesitant to do this because every time I have worked with anything AWS related I have wasted hours trying to figure out how to get everything configured correctly. Fortunately SNS wasn't too complicated, and their docs helped me through it. One great benefit is that you get something like 1 million requests free on the AWS Free Tier. This should be plenty to get me started.

Here's a truncated version of how I'm using SNS.
```typescript
import {
  SNSClient,
  PublishCommand,
  PublishCommandInput,
} from "@aws-sdk/client-sns";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

export interface SendSMSInput {
  to: string;
  subject: string;
  text: string;
}

const sns = new SNSClient();

// Create instance of phone util for formatting
const phoneUtil = PhoneNumberUtil.getInstance();

export const sendSMS = async (input: SendSMSInput) => {
  // make sure phone is E164 format
  const phone = phoneUtil.parse(input.to);
  const params: PublishCommandInput = {
    Message: input.text,
    PhoneNumber: phoneUtil.format(phone, PhoneNumberFormat.E164),
    Subject: input.subject,
  };
  try {
    return sns.send(new PublishCommand(params));
  } catch (err) {
    console.error(err, err.stack);
    return null;
  }
};
```

### <a name="shortener"></a> URL Shortener
Once I setup SMS notifications I realized that I would need a URL shortener. Since I'm using the Magic Link authentication process, the URLs can be quite long. In an SMS, this is terrible to see.

After some research, I decided to give [Kutt](https://kutt.it/) a try. It's open source and free, and there is a node SDK which can make it easy to use. 

It was simple to setup and use. Here's a shortened version of how I use it.

```typescript
import Kutt from "kutt";

export const getShortUrl = async ({ expiresIn, target }) => {
  const kutt = new Kutt();
  kutt.setTimeout(expiresIn);
  const url = await kutt.submit({ target });
  return url.shortUrl;
};
```

### <a name="crons"></a> Schedule jobs
Since I decided to host on Vercel, I don't really have a server to run crons on. The backend is all serverless functions. But, one feature that Status Tracker provides is the ability to set a reminder for yourself. For example, when you create a new job, you want to remind yourself 1 hour after the job is scheduled to update the status.

In order to create these scheduled reminders, I needed to be able to have a cron or some sort of scheduled job. I thought about going with another AWS service for this, but once again I'm always hesitant about this.

Then I found [Quirrel](https://quirrel.dev/). Their whole thing is "Quirrel makes job queues simple as cake." This is what I was looking for.

The docs looked simple and straight forward. The technology is open-source. The pricing plans are good for a small Saas like mine. I decided to go for it.

Basically I created an API endpoint to create a new queued job. This endpoint tells Quirrel when to execute the job, and an API endpoint to call at that time. Then I have another endpoint which receives the call from Quirrel at the scheduled time, and it sends the notifications using the referenced data.

The slogan was pretty spot-on. It was simple to setup, the docs walked me through it, and I got it up and running quickly. So far I have been happy with the service as well.

### <a name="customer"></a> Customer portal
This was the fun part. I wanted to create a custom sub-domain for each organization who uses Status Tracker. I also wanted to give them the ability to use their own branding instead of ours, similar to how Stripe does with their checkout portal.

When a user creates a new organization, they provide the name, and we auto-generate a subdomain. However they are given the choice to change the subdomain if they don't like what we created.
![A form showing an input for Company Name and URL Slug.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oue5bsey17i7alvq3dum.png)

Once the company is created they can configure their branding if they choose under their company settings.
![Screenshot showing two color picker fields for Primary and Secondary colors, and a photo upload field for Logo.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/c79dac9gen5246vr2dlt.png)

There were two major things I had to figure out at this point.

1. How could I auto-create the company's subdomain so that I don't have to manually do this each time?
2. How could I build the customer portal using a dynamic theme which comes from database values?

#### Creating the subdomains
I didn't want to deal with setting up (even if automated) Nginx configs and SSL certs every time a new company registered. I decided to try using a wildcard subdomain which points to a general customer portal.

I'm using Vercel to host the app, so I pointed my domain servers to Vercle and configured the DNS to use `*.statustracker.app` for this secondary app. Vercel took care of the SSL cert.

In the app itself (another Next.js client-only app), I created the same `theme.ts` file with the standard Status Tracker branding as the default theme. I already had a custom `_app.tsx` file to handle some other things, so in there I added a custom `getInitialProps` function.

>NOTE - I have discovered since building this that perhaps I should be using `getServerSideProps` instead. I will be testing this change soon.

In this function I call the API to retrieve the company using the slug from the subdomain. If none is found I redirect to the main Status Tracker site. If it does find a company, it returns the theme settings to the component.

#### Custom branding
In the component where I create the theme provider, I check for any custom theme settings provided by the app props before creating the theme provider, using the default theme as a fallback.

Here is a sample of the difference in branding on the login page.
![Two screenshots of the customer portal showing a logo and a simple login form. One screenshot uses the Status Tracker logo and colors - purple and green-ish. The other uses a logo for Acme, Inc. and their brand colors - red and black.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2vpyg7o0qwv4rrgljdwi.png)

## That's a wrap
That is everything interesting I could think to write about my experience building the app. I plan to write more about the project as it progresses. You can follow [me on dev.to](https://dev.to/rain2o), or follow along the milestones of Status Tracker on [the Indie Hackers product page](https://www.indiehackers.com/product/status-tracker).

If you have any questions, or want to know more about something in particular leave a comment and let me know!
