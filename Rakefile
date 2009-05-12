require "rake/clean"

CLOBBER << ["www/plumb.js"]

desc "Use Sprockets to build www/plumb.js"
task :build_javascripts do
  require "rubygems"
  require "sprockets"
  
  secretary = Sprockets::Secretary.new(
    :asset_root   => "www",
    :load_path    => ["vendor/*/src"],
    :source_files => ["src/plumb.js"]
  )
  
  concatenation = secretary.concatenation
  concatenation.save_to("www/plumb.js")
end

task :default => :build_javascripts
