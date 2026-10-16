#!/usr/bin/env bash
cd /home/jeder/proyectos/scrapper-meta-pro
exec node dist/cli.js session \
  --url "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=ebook&search_type=keyword_unordered&sort_data%5Bdirection%5D=desc&sort_data%5Bmode%5D=total_impressions" \
  --limit 100 --db e2e41live --data-dir /tmp/meta-e2e-41 --profile main \
  < /tmp/meta-e2e-41/cmd.fifo > /tmp/meta-e2e-41/session.log 2>&1
