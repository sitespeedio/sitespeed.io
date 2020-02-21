## The plan

I totally had my head down before, this it the updated plan to work to, based on the original issue

### co2

- takes care of converting transfer to CO2
- mainly relies on a single function that works out emissions from transfer.
- if `green` is passed for transfer figure, we apply the green figure for transferring data
- add helper methods to breakdown by domain, and accounting for green/grey at a domain level

### hosting

- takes care of marking domains as green or not
- shields users from greenweb foundation API, returns only the domain list of green domains on a page, til we know we will use anything else.
- checks against an api to return the green/gray status, and maaaybe against a local sqlite database snapshot published if folk don't want to make reqs to an API

## Top resources

Use the page xray,and its list of assets. if we have hosting check enabled, account for emissios in list.

## Showing things in pug

How to present sensible figures

Checkout the helper for bytes https://github.com/sitespeedio/sitespeed.io/blob/green/lib/support/helpers/size.js
