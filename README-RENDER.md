# BANDEVI GLOBAL GROUP Render Deployment

This folder is a separate static website package for `bandeviglobalgroup.com`.

## Render Static Site Settings

- Service type: Static Site
- Service name: `bandevi-global-group-site`
- Build command: `echo "BANDEVI GLOBAL GROUP static site ready"`
- Publish directory: `.`
- Custom domain: `bandeviglobalgroup.com`

The included `render.yaml` can be used as a Render Blueprint if this folder is pushed as its own repository.

## Domain Notes

Add `bandeviglobalgroup.com` to the Render service's Custom Domains settings. Render will also add `www.bandeviglobalgroup.com` and redirect it to the root domain.

After Render gives the DNS records, update the DNS provider for `bandeviglobalgroup.com`, remove any conflicting `AAAA` records, then return to Render and click Verify.
