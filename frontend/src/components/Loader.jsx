<button
  disabled={loading}
  className="px-5 py-3 bg-blue-600 text-white rounded-xl"
>
  {loading ? (
    <Loader
      text=""
      size="small"
    />
  ) : (
    "Save Changes"
  )}
</button>