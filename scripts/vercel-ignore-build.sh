#!/bin/bash
# Ignored Build Step Vercel (dipanggil lewat "ignoreCommand" di vercel.json).
# Exit 0 = LEWATI build, exit selain 0 = lanjut build.
#
# Tujuannya menghemat Build CPU Minutes: commit yang cuma mengubah dokumentasi
# (docs/, *.md) atau migration Supabase tidak mengubah website, jadi tidak
# perlu build. Branch selain main juga tidak di-deploy (tidak ada preview).
#
# Dibandingkan dengan commit deploy terakhir yang berhasil
# (VERCEL_GIT_PREVIOUS_SHA), bukan cuma commit sebelumnya, supaya push berisi
# commit kode + commit dokumentasi tetap ter-build. Kalau perbandingan gagal
# (mis. commit lama tidak ada di clone dangkal), git diff keluar dengan kode
# selain 0/1 dan build tetap jalan — aman secara default.

if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then
  echo "Lewati build: branch '$VERCEL_GIT_COMMIT_REF' bukan main."
  exit 0
fi

BASE="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"

git diff --quiet "$BASE" HEAD -- . \
  ':(exclude)docs' \
  ':(exclude).claude' \
  ':(exclude)supabase' \
  ':(exclude)*.md'
status=$?

if [ $status -eq 0 ]; then
  echo "Lewati build: sejak $BASE tidak ada perubahan yang memengaruhi website."
  exit 0
fi

echo "Lanjut build (git diff status $status)."
exit 1
