docker run --rm -v "$(pwd)/seed-articles.sql:/seed.sql:ro" postgres:16-alpine \
  psql "postgresql://postgres:postgres123@host.docker.internal:5433/cryptopulse" -f /seed.sql
